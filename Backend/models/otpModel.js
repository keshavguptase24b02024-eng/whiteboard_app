const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true // Removes accidental spaces before/after the name
    },
    email: { 
        type: String, 
        required: true,
        trim: true,
        lowercase: true // CRITICAL: Ensures "Email@gmail.com" and "email@gmail.com" are treated equally
    },
    password: { 
        type: String, 
        required: true 
    },
    otp: { 
        type: String, 
        required: true,
        trim: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 600 // Automatically deletes the document after 10 minutes
    }
});

module.exports = mongoose.model('Otp', otpSchema);