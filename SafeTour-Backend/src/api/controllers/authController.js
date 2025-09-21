const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

exports.register = async (req, res) => {
    try {
        const { name, email, password, emergencyContact } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password, emergencyContact });
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, config.jwtSecret, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};



exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // 3. User is valid, create and return JWT
        const payload = {
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            config.jwtSecret,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};