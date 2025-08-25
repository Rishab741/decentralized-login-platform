// backend/server.js
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const crypto = require('crypto');
const session = require('express-session'); // Import express-session

const app = express();
const port = 3001;

// --- Middleware Setup ---

// 1. CORS (Cross-Origin Resource Sharing)
// This allows your frontend (running on a different port) to make requests to this backend.
app.use(cors({
    origin: 'http://localhost:5173', // Your Vite frontend URL
    credentials: true, // This is important for sending cookies
}));

// 2. JSON Parser
// This allows the server to understand JSON data sent from the frontend.
app.use(express.json());

// 3. Session Management
// This sets up the session cookies.
app.use(session({
    secret: 'your-super-secret-key-that-should-be-long-and-random', // IMPORTANT: Change this in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (requires HTTPS)
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie (important for security)
        maxAge: 1000 * 60 * 60 * 24 // Cookie will expire in 24 hours
    }
}));

// --- In-memory storage for nonces ---
// A nonce (number used once) is a random string to prevent replay attacks.
const nonces = {};


// --- API Endpoints ---

/**
 * @route GET /login-challenge
 * @description Generates a unique message for a user to sign.
 */
app.get('/login-challenge', (req, res) => {
    const userAddress = req.query.address;
    if (!userAddress) {
        return res.status(400).json({ error: 'Wallet address is required.' });
    }

    const nonce = crypto.randomBytes(32).toString('hex');
    nonces[userAddress.toLowerCase()] = nonce;
    
    const message = `Please sign this message to log in to the Decentralized Job Platform. Nonce: ${nonce}`;
    res.json({ message });
});

/**
 * @route POST /login-verify
 * @description Verifies a signed message and creates a user session upon success.
 */
app.post('/login-verify', (req, res) => {
    const { address, signature } = req.body;
    const userAddress = address.toLowerCase();
    const originalNonce = nonces[userAddress];

    if (!originalNonce) {
        return res.status(400).json({ error: 'Invalid or expired challenge. Please try again.' });
    }

    const originalMessage = `Please sign this message to log in to the Decentralized Job Platform. Nonce: ${originalNonce}`;

    try {
        const recoveredAddress = ethers.verifyMessage(originalMessage, signature);

        if (recoveredAddress.toLowerCase() === userAddress) {
            // Signature is valid! Create the session.
            req.session.user = { address: userAddress };
            
            // The nonce has been used, so we delete it.
            delete nonces[userAddress]; 
            
            res.json({ success: true, message: 'Login successful!' });
        } else {
            res.status(401).json({ success: false, message: 'Signature verification failed.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred during verification.' });
    }
});

/**
 * @route GET /profile
 * @description Checks if a user has an active session and returns their profile data.
 */
app.get('/profile', (req, res) => {
    if (req.session.user) {
        res.json({ isLoggedIn: true, user: req.session.user });
    } else {
        res.json({ isLoggedIn: false });
    }
});

/**
 * @route POST /logout
 * @description Destroys the user's session.
 */
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        // The default session cookie name is 'connect.sid'
        res.clearCookie('connect.sid'); 
        res.json({ success: true, message: 'Logged out successfully.' });
    });
});


// --- Start the Server ---
app.listen(port, () => {
    console.log(`✅ Backend server is running at http://localhost:${port}`);
});
