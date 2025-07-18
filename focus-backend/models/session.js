
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema
(
    {
        url: String,
        origin: String,
        startTime: Date,
        endTime: Date,
        duration: Number, 
        createdAt: { type: Date, default: Date.now }
    }
);

module.exports = mongoose.model('Session', sessionSchema);