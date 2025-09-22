// src/api/controllers/alertController.js
const Alert = require('../../models/Alert');

exports.getActiveAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ status: 'active' })
            .populate('user', ['name', 'email', 'emergencyContact'])
            .sort({ createdAt: -1 }); // Newest first

        res.json(alerts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};