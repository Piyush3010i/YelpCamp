const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose.default); // this will setup a defualt username and password attribute in userSchema

module.exports = mongoose.model('User', UserSchema);    