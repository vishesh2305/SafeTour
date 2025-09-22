// src/models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);