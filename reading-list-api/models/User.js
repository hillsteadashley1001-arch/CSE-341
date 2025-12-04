const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

provider: { type: String, required: true, default: 'google' },

providerId: { type: String, required: true, unique: true },

email: String,

name: String,

avatar: String,

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);