const baseJoi= require('joi');
const sanitizeHtml = require('sanitize-html');

// html sanitation code  
const extension = (joi)=>({
  type: 'string',
  base: joi.string(),
  messages:{
    'string.escapeHTML':'{{#label}} must not include HTML!'
  },
  rules:{
    escapeHTML: {
      validate(value, helpers){
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if(clean!== value)return helpers.error('string.escapeHTML',{value})
          return clean;
      }
    }
  }
})

const Joi = baseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    // why here campground is a key because inside our form everything is
    // campground, square brackets, like campground[title],campground[description]...etc. So the
    // body must include campgrounds and we expecting it to be an object

    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
  }).required(),
  deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(0).max(5),
        body: Joi.string().required().escapeHTML()
    }).required(),
})