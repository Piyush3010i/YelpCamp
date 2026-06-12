const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');
const Schema = mongoose.Schema;

// ↓↓↓ add this code for cluster map ↓↓↓
const opts = { toJSON: { virtuals: true } };
// ↑↑↑ add this code for cluster map ↑↑↑

// separate image schema to store url and filename
const ImageSchema =new Schema({
    url: String,
    filename: String
}) 

ImageSchema.virtual('thumbnail').get(function(){ // this virtual function will make some changes in url of image
    return this.url.replace('/upload','/upload/w_200');// this change /upload to /upload/w_200 in url
})

const CampgroundSchema= new Schema({// creating Campground schema
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,

    //geometry field in campground schema to store coordinates 
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author:{
        type:Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
},opts); // use opts here now 



// ↓↓↓ add this virtual function code for clustor map ↓↓↓
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});
// ↑↑↑ add this code ↑↑↑

//this is a query middleware when we delete a campground this middleware runs and checks if there is any review array inside the doc associated
// with campground and removes all the reviews associated to that specific campgounds
CampgroundSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})

module.exports= mongoose.model("Campground",CampgroundSchema);