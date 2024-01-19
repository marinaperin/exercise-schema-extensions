import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;
import Musician from "./musicianModel.js";

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    duration_seconds: {
      type: Number,
      required: true,
    },
    musician: {
      type: SchemaTypes.ObjectId,
      ref: "Musician",
      default: null,
    },
    poster: {
      type: String,
    },
  },
  { timestamps: true }
);

schema
  .virtual("duration_minutes")
  .get(function () {
    return this.duration_seconds / 60;
  })
  .set(function (minutes) {
    this.duration_seconds = minutes * 60;
    this.save();
  });

schema.virtual("radioTitle").get(function () {
  return `${Musician.findById(this.musician).populate(
    "musician",
    "artName -_id"
  )} - ${this.title} (${this.duration_minutes})`;
});

schema.pre("save", async function (next) {
  //oldMusician
  if (this.isModified("musician")) {
    const Album = this.constructor;
    const albumId = this._id.toString();
    const oldAlbum = await Album.findById(albumId);
    const oldMusicianId = oldAlbum.musician?.toString();
    if (oldMusicianId) {
      const oldMusician = await Musician.findById(oldMusicianId);
      if (oldMusician) {
        await oldMusician.removeAlbum(albumId);
        console.log("PRE save", "Album rimosso dal vecchio musicista.");
      }
    }
  }
  next();
});

schema.post("save", async function (doc, next) {
  //newMusician
  const newAlbum = doc;
  const albumId = newAlbum._id.toString();
  const newMusicianId = newAlbum.musician?.toString();
  if (newMusicianId) {
    const newMusician = await Musician.findById(newMusicianId);
    if (newMusician) {
      await newMusician.addAlbum(albumId);
      console.log("POST save", "Album aggiunto al nuovo musicista.");
    }
  }
  next();
});

schema.pre("remove", async function (next) {
  //oldMusician
  const oldAlbum = this;
  const albumId = oldAlbum._id.toString();
  const oldMusicianId = oldAlbum.musician?.toString();
  if (oldMusicianId) {
    const oldMusician = await Musician.findById(oldMusicianId);
    if (oldMusician) {
      await oldMusician.removeAlbum(albumId);
      console.log("PRE remove", "Album rimosso dal vecchio musicista.");
    }
  }
  next();
});

schema.statics.paginate = async function (pageNum, resultsNum, sortOpt) {
  const skipAmount = (pageNum - 1) * resultsNum;
  const [total_results, results] = await Promise.all([
    this.countDocuments(),
    this.find().sort(sortOpt).skip(skipAmount).limit(resultsNum),
  ]);
  const total_pages = Math.ceil(total_results / resultsNum);

  return {
    page: pageNum,
    results,
    total_results,
    total_pages,
  };
};

const Album = model("Album", schema);

export default Album;
