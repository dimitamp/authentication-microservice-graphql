/* eslint-disable func-names */
const mongoose = require('mongoose')
const beautifyUnique = require('mongoose-beautiful-unique-validation')

const ResetSchema = new mongoose.Schema({
  email: {
    index: true,
    type: String,
    required: true,
    unique: 'A token already exists for that email!',
    lowercase: true
  },
  token: {
    type: String,
    required: true
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: '12h'
  }
})

// Plugin for Mongoose that turns duplicate errors into regular Mongoose validation errors.

ResetSchema.plugin(beautifyUnique)

mongoose.pluralize(null)
module.exports = mongoose.model('Reset', ResetSchema)
