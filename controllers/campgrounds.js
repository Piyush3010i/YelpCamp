if(process.env.NODE_ENV!=="production"){
  require('dotenv').config({quiet:true});
}

const Campground = require("../models/campground.js");
const {cloudinary} =require("../cloudinary/index.js");
const maptilerClient = require("@maptiler/client");
const {escapeRegex} = require("../middleware.js");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

//controller for showing all campground
module.exports.index = async (req, res) => {
  if(req.query.search){
    // Create a case-insensitive regular expression to match partial titles
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    
    const campgrounds = await Campground.find({title:regex});
    res.render("campgrounds/index.ejs", { campgrounds });
  }else{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index.ejs", { campgrounds });
  }
  
};

//controller for rendering new campground form
module.exports.renderNewCampground = (req, res) => {
  res.render("campgrounds/new.ejs");
};

//controller for creating new campground 
module.exports.createNewCampground = async (req, res) => {
    
    // ↓↓↓ our geo code for maps ↓↓↓
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }

    const campground = new Campground(req.body.campground);
    // ↓↓↓ part of geocode ↓↓↓
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    // ↑↑↑ part of geocode ↑↑↑

    campground.images=req.files.map(f=>({ // if we upload 2 or more photos, this function will map those images stored in array
      url: f.path,                       // and map them using theses simple object : url, filename and save those object in campground immages
      filename: f.filename
      }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground.images);
    req.flash('success','Successfully created new Campground!');
    res.redirect(`/campgrounds/${campground._id}`); // this will redirect to the show page with the new campground data
  };

  //controller for showing a particular campground

  module.exports.showCampground = async (req, res) => {
      const{id} = req.params;
      // if (!mongoose.Types.ObjectId.isValid(id)) {
      //   req.flash("error", "Invalid Campground ID!");
      //   return res.redirect("/campgrounds");
      // }
      const campground = await Campground.findById(id).
      populate({
        path:"reviews",
        populate:{
          path:"author" // populate author of separate reviews
        }
      }).populate("author"); //populate author of campground // finding campgrounds through their id
      if(!campground){
        req.flash('error','Cannot find that Campground!');
        return res.redirect('/campgrounds');
      }
      res.render("campgrounds/show.ejs", { campground });
    };

    // controller for rendering edit form for particular campground
    module.exports.renderEditCampground = async (req, res) => {
        const {id} = req.params;
        const campground = await Campground.findById(id); // finding campgrounds through their id
        if (!campground) {
          req.flash("error", "Cannot find that Campground!");
          return res.redirect("/campgrounds");
        }
        res.render("campgrounds/edit.ejs", { campground });
      };
      
    // controller for putting/showing edited campground
    module.exports.putEditCampground = async (req, res) => {
        const { id } = req.params;

        // ↓↓↓ using same geo code on update route  ↓↓↓
        const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
        // console.log(geoData);
        if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
        }
        // ↑↑↑ our geo code ↑↑↑

        const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
        // ↓↓↓ part of geo code ↓↓↓
        campground.geometry = geoData.features[0].geometry;
        campground.location = geoData.features[0].place_name;
        // ↑↑↑ part of geocode ↑↑↑

        const imgs= req.files.map(f=>({url: f.path, filename: f.filename}));
        campground.images.push(...imgs);
        if(req.body.deleteImages){
          for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
          }
          await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        }
        await campground.save();
        req.flash("success", "Successfully updated the Campground!");
        res.redirect(`/campgrounds/${campground._id}`);
      };
    
    // controller for deleting a campground
    module.exports.deleteCampground = async (req, res) => {
      const { id } = req.params;
      await Campground.findByIdAndDelete(id);
      req.flash("success", "Successfully deleted the Campground!");
      res.redirect("/campgrounds");
    };
