// src/api/controllers/touristController.js
const Alert = require('../../models/Alert');

exports.triggerPanic = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        
        // req.user.id comes from the authMiddleware
        const newAlert = new Alert({
            user: req.user.id,
            location: {
                latitude,
                longitude
            }
        });

        await newAlert.save();

        // In a real-world app, you would also trigger notifications here
        // (e.g., to police, emergency contacts via SMS, push notifications).

        res.status(201).json({ msg: 'Panic alert successfully triggered and logged.', alert: newAlert });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};