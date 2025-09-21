const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===================================================================================
//  DATABASE PLACEHOLDER
//  In a real production environment, this would be a connection to a database
//  like MongoDB, PostgreSQL, or Firebase Firestore. We are using a simple
//  in-memory array here to demonstrate the logic without requiring a DB setup.
// ===================================================================================
const users = [];
// ===================================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new tourist user
 * @access  Public
 * @body    { email, password, walletAddress }
 */
router.post('/register', async (req, res) => {
    const { email, password, walletAddress } = req.body;

    // --- 1. Input Validation ---
    if (!email || !password || !walletAddress) {
        return res.status(400).json({ message: 'Please provide email, password, and walletAddress.' });
    }

    try {
        // --- 2. Check for Existing User ---
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // --- 3. Hash the Password ---
        // A salt is random data added to the password before hashing.
        // This ensures that even identical passwords result in different hashes.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- 4. Create and "Save" the New User ---
        const newUser = {
            id: users.length + 1, // Simple unique ID for our mock DB
            email: email,
            password: hashedPassword,
            walletAddress: walletAddress,
            createdAt: new Date()
        };
        users.push(newUser);
        console.log(`[Auth] New user registered: ${email}`);

        // --- 5. Generate a JWT ---
        const payload = {
            user: {
                id: newUser.id,
                email: newUser.email,
                walletAddress: newUser.walletAddress
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }, // Token will be valid for 7 days
            (err, token) => {
                if (err) throw err;
                // --- 6. Send Response ---
                res.status(201).json({
                    token,
                    user: payload.user
                });
            }
        );

    } catch (error) {
        console.error("[Register Error]", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});


/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user and get a token
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // --- 1. Input Validation ---
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // --- 2. Find User in "Database" ---
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // --- 3. Compare Passwords ---
        // bcrypt.compare securely compares the plain-text password from the request
        // with the hashed password stored in our database.
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // --- 4. Generate a JWT ---
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                walletAddress: user.walletAddress
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                // --- 5. Send Response ---
                console.log(`[Auth] User logged in: ${email}`);
                res.status(200).json({
                    token,
                    user: payload.user
                });
            }
        );

    } catch (error) {
        console.error("[Login Error]", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});


module.exports = router;

