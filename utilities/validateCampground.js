const Joi= require('joi');
const customError= require('./expressError.js');

// below code is very important 
const validateCampground = (req, res, next) => {
  const campgroundSchema = Joi.object({
    campground: Joi.object({
      // why here campground is a key because inside our form everything is 
      // campground, square brackets, like campground[title],campground[description]...etc. So the 
      // body must include campgrounds and we expecting it to be an object

      title: Joi.string().required(),
      price: Joi.number().required().min(0),
      image: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string().required(),
    }).required(),
  });

  const result = campgroundSchema.validate(req.body);
  if (result.error) {
    const msg= result.error.details.map(el=>el.message).join(',');// either we can do it like this
    // const msg = result.error.details[0].message; // or like this
    throw new customError(msg, 400);
  } else {
    next();
  }
  //  console.log(result.error.details[0].message);
};

module.exports= validateCampground;
