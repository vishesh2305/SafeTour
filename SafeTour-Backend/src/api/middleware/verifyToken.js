const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Access Denied. No token provided.' });

    try {
        // The token is expected to be in the format "Bearer <token>"
        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Access Denied. Malformed token.' });

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next(); // Proceed to the next function in the chain
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};