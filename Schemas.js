const Joi= require('joi')

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    // why here campground is a key because inside our form everything is
    // campground, square brackets, like campground[title],campground[description]...etc. So the
    // body must include campgrounds and we expecting it to be an object

    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
  deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(0).max(5),
        body: Joi.string().required()
    }).required(),
})