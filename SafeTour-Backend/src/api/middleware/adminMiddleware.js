// src/api/middleware/adminMiddleware.js
const User = require('../../models/User');

module.exports = async function(req, res, next) {
    try {
        // req.user.id is attached by the authMiddleware
        const user = await User.findById(req.user.id);

        if (user.role !== 'admin' && user.role !== 'police') {
            return res.status(403).json({ msg: 'Access denied. Requires admin privileges.' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};