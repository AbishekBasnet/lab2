const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^(?:[a-zA-Z0-9_'^&amp;+%$#!?{}~`|\/.-]+)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    match: /^\d{10}$/
  }
});

module.exports = mongoose.model('User', userSchema);
