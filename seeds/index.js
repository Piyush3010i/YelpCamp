
const mongoose= require('mongoose');
const cities= require('./cities');
const {places, descriptors}= require('./seedHelpers');
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
    for(let i=0; i<50; i++){
        const random1000= Math.floor( Math.random()* 1000);// generating random no
        const price= Math.floor( Math.random()* 1000);// generating random no 
        const camp = new Campground({
          // creating instance of Campground model
          author:'6a2546f1957386b704208645',
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
            {
                url: 'https://res.cloudinary.com/dvcihmixo/image/upload/v1781106803/CampSite/wgbxrd8hgkjebhseboin.jpg',
                filename: 'CampSite/wgbxrd8hgkjebhseboin'
            },
            {
                url: 'https://res.cloudinary.com/dvcihmixo/image/upload/v1781106807/CampSite/eu19xf5sonyil1hzxr7x.jpg',
                filename: 'CampSite/eu19xf5sonyil1hzxr7x'
            },
            {
                url: 'https://res.cloudinary.com/dvcihmixo/image/upload/v1781106807/CampSite/xypoee0zmnbeyi18fzuv.jpg',
                filename: 'CampSite/xypoee0zmnbeyi18fzuv'
            },
            {
                url: 'https://res.cloudinary.com/dvcihmixo/image/upload/v1781106810/CampSite/yw3pgxs04jto1xythdyu.jpg',
                filename: 'CampSite/yw3pgxs04jto1xythdyu'
                }
            ],
        });
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();// code to close the db after connecting 
});// executing seed database