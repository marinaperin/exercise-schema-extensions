import dayjs from "dayjs";
import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    artName: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    albums: [
      {
        type: SchemaTypes.ObjectId,
        ref: "Album",
      },
    ],
    poster: String,
  },
  { timestamps: true }
);

schema
  .virtual("fullName")
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (value) {
    const space = value.indexOf(" ");
    const firstName = value.substring(0, space);
    const lastName = value.substring(space + 1);
    this.firstName = firstName;
    this.lastName = lastName;
    this.save();
  });

schema.virtual().get(function () {
  return dayjs().diff(dayjs(this.birthDate), "years");
});

schema.methods.removeAlbum = async function (albumId) {
  const albums = this.albums.map((a) => a.toString());
  if (albums.includes(albumId)) {
    albums.splice(albums.indexOf(albumId), 1);
    this.albums = albums;
    await this.save();
  }
};

schema.methods.addAlbum = async function (albumId) {
  this.albums.push(albumId);
  await this.save();
};
const Musician = model("Musician", schema);

export default Musician;
