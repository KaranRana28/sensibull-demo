const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const bcrypt = require('bcryptjs');
const config = require("config");

const userSchema = new mongoose.Schema({
   name: { type: String, required: true },
   email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   createdAt: {
      type: Date,
      default: Date.now()
   },
   updatedAt: {
      type: Date,
      default: Date.now()
   }
});

userSchema.methods.generateHash = async function (pass) {
   const salt = await bcrypt.genSalt(10);
   return await bcrypt.hash(pass, salt);
}

userSchema.methods.generateAuthToken = async function (user) {
   const token = jwt.sign({ _id: user.id }, config.get("jwtPrivateKey"));
   return token;
}

const User = mongoose.model('User', userSchema)

function validateUser(user) {
   const schema = Joi.object({
      id: Joi.objectId(),
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
   })
   return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;