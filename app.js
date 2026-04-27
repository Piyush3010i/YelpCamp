const express= require('express');
const app= express();
const path= require('path');
const mongoose= require('mongoose');
const Campground= require('./models/campground');
const methodOverride= require("method-override");
const ejsMate= require('ejs-mate');
const {campgroundSchema,reviewSchema}= require('./Schemas.js');
const morgan= require('morgan');
const customError= require('./utilities/expressError.js');
const wrapAsync= require('./utilities/wrapAsync.js');
const Review= require('./models/review');

// mongoose connect and error handling
mongoose.connect('mongodb://127.0.0.1:27017/Yelp-Camp')
const db= mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

// ejs engine and views set up
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.engine('ejs',ejsMate);

// middleware setup
app.use(express.urlencoded({ extended: true}));// middleware to parse the url as our data for req.body
app.use(methodOverride('_method'));// middleware for method override for put,patch, delete method
app.use(morgan("dev"));

//campground postman validation
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(","); // either we can do it like this
    // const msg = result.error.details[0].message; // or like this
    throw new customError(msg, 400);
  } else {
    next();
  }
  //  console.log(result.error.details[0].message);
};

//review postman validation
const validateReview= (req, res, next)=>{
    const{error}= reviewSchema.validate(req.body);
    if(error){
        const  msg= error.details.map((el)=> el.message).join(",");
        throw new customError(msg, 400);
    }
    else{
        next();
    }
}


// home yelpcamp route
app.get('/',(req,res)=>{
    res.render('home.ejs');
})

// route to find all campgrounds
app.get("/campgrounds", wrapAsync( async(req, res) => {
  const campgrounds= await Campground.find({});
  res.render('campgrounds/index.ejs',{campgrounds});
}))

// get route for render new campground form
app.get("/campgrounds/new", (req, res)=>{
    res.render("campgrounds/new.ejs");
})// note this must be above the show route to avoid app crash

// post route to submit the data from new Campground form
app.post("/campgrounds", validateCampground, wrapAsync( async(req,res)=>{
    // if(!req.body.campground){
    //     throw new customError("Invalid Campground Data!", 400);
    // }

    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`campgrounds/${newCampground._id}`);// this will redirect to the show page with the new campground data
}))

// route to show a particular campground
app.get("/campgrounds/:id", wrapAsync( async(req, res)=>{
    const campground= await Campground.findById(req.params.id).populate('reviews');// finding campgrounds through their id
    res.render('campgrounds/show.ejs',{campground});
}))

// get route for rendering the edit campground form
app.get("/campgrounds/:id/edit", wrapAsync( async(req,res)=>{
    const campground = await Campground.findById(req.params.id); // finding campgrounds through their id
    res.render("campgrounds/edit.ejs", { campground });
}))

// put route for updating the campground
app.put("/campgrounds/:id", validateCampground, wrapAsync( async(req,res)=>{
    const {id}= req.params;
    const campground= await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete route for deleting the campground
app.delete('/campgrounds/:id', wrapAsync( async(req,res)=>{
    const {id}= req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// post route for posting reviews
app.post('/campgrounds/:id/reviews', validateReview,wrapAsync( async(req,res)=>{
    const campground= await Campground.findById(req.params.id);
    const review= new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.all("*", (req, res, next) => {
  next(new customError('Page not found!', 404));
});
app.use((err, req, res, next)=>{
    // const {status= 500, message= "Something went wrong!"}= err;
    const {status= 500}= err;
    if(!err.message){
        err.message= "Oh no! Something went wrong!";
    }
    res.status(status).render("error.ejs", {err});
})

// port information 
app.listen(4000,()=>{
    console.log("Serving on port: 4000");
})