const Campground = require("../models/campground.js");

//controller for showing all campground
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index.ejs", { campgrounds });
};

//controller for rendering new campground form
module.exports.renderNewCampground = (req, res) => {
  res.render("campgrounds/new.ejs");
};

//controller for showing new campground 
module.exports.showNewCampground = async (req, res) => {

    // if(!req.body.campground){
    //     throw new customError("Invalid Campground Data!", 400);
    // }
    
    const campground = new Campground(req.body.campground);
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
        const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
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
