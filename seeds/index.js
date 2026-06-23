if(process.env.NODE_ENV!=="production"){
  require('dotenv').config({quiet:true});
}


const mongoose= require('mongoose');
const cities= require('./cities');
const {places, descriptors}= require('./seedHelpers');
const campImages = require('./campImage');
const Campground= require('../models/campground');
const { coordinates } = require('@maptiler/client');
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/Yelp-Camp";

// mongoose connect and error handling
mongoose.connect(dbUrl)
const db= mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const sample= array=> array[Math.floor( Math.random() * array.length)];

// creating seed database
const seedDB= async()=>{
    await Campground.deleteMany({});
    for(let i=0; i<25; i++){
        const random1000= Math.floor( Math.random()* 1000);// generating random no
        const price= Math.floor( Math.random()* 1000);// generating random no 
        // const randomImageIndex= Math.floor( Math.random()*25);
        const camp = new Campground({
          // creating instance of Campground model
          author:'6a32144892f87592877f213d',
          location: `${cities[random1000].city}, ${cities[random1000].state}`,
          geometry:{
            type: "Point",
            coordinates:[
                cities[random1000].longitude,
                cities[random1000].latitude
            ]
          },
          title: `${sample(descriptors)} ${sample(places)}`,
          description:
            "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi nesciunt, possimus illo laborum tempora reiciendis autem voluptates non minus saepe expedita sit deserunt hic optio impedit est molestiae omnis suscipit?",
          price,
          images:[
           sample(campImages),
           sample(campImages),
           sample(campImages),
           sample(campImages)
        ],
        });
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();// code to close the db after connecting 
});// executing seed database