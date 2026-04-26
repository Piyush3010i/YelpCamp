
const mongoose= require('mongoose');
const cities= require('./cities');
const {places, descriptors}= require('./seedHelpers');
const Campground= require('../models/campground');

// mongoose connect and error handling
mongoose.connect('mongodb://127.0.0.1:27017/Yelp-Camp')
const db= mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const sample= array=> array[Math.floor( Math.random() * array.length)];

// creating seed database
const seedDB= async()=>{
    await Campground.deleteMany({});
    for(let i=0; i<50; i++){
        const random1000= Math.floor( Math.random()* 1000);// generating random no
        const price= Math.floor( Math.random()* 1000);// generating random no 
        const camp = new Campground({
          // creating instance of Campground model
          location: `${cities[random1000].city}, ${cities[random1000].state}`,
          title: `${sample(descriptors)} ${sample(places)}`,
          image: "https://picsum.photos/400?random=${Math.random()}",
          description:
            "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi nesciunt, possimus illo laborum tempora reiciendis autem voluptates non minus saepe expedita sit deserunt hic optio impedit est molestiae omnis suscipit?",
          price,
        });
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();// code to close the db after connecting 
});// executing seed database