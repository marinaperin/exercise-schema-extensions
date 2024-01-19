import dotenv from "dotenv";
dotenv.config();
const { MONGODB_URI } = process.env;
import mongoose from "mongoose";
import Album from "./models/albumModel.js";
import Musician from "./models/musicianModel.js";

const run = async () => {

    try{

        await mongoose.connect(MONGODB_URI);

        //Album ID: 65aa42bb736c3e56c1e1f0d0
        // const doc = new Album({
        //     title: 'Album Figo',
        //     duration_seconds: 320
        // })

        //Tizio ID: 65aa4352d35f8ec9459d327b
        //Mega ID: 65aa4c0ed00260c68f4c4be9
        // const doc = new Musician({
        //     firstName: 'Poverino',
        //     lastName: 'Piccolino',
        //     artName: 'Megaboss',
        //     birthDate: '02/11/1990'
        // });

        // const doc = await Album.findById('65aa42bb736c3e56c1e1f0d0');
        // doc.musician = '65aa4c0ed00260c68f4c4be9';
        // doc.musician = null;

        const doc = await Musician.findById('65aa4c0ed00260c68f4c4be9');

        // await doc.save();

        console.log(doc);


    }catch(error){

        console.log(error.message)

    }

}

run();