const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: Number,
    email: String,
    password: String,
    first_name: String,
    last_name: String,
    gender: String,
    address: String,
    mobile: String,
    dob: String
});

module.exports = mongoose.model('User', userSchema);