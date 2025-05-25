const express = require('express');
const connectDB = require('./db');
const path = require('path');
const User = require('./models/User');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//const token = jwt.sign({ userId: User._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
// Secret key (isse safe jagah environment variable mein store karo)
const JWT_SECRET = process.env.JWT_SECRET || '7b6f7cae484a1e2438f752ffbce701cd203891908d22406dbefc7e2127046d06';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]; // Format: Bearer <token>

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // you can access user info in next middlewares
        next();
    });
}


const app = express();
app.use(express.json());
app.use(cors()); // ⬅️ Allow frontend to access backend

connectDB();

const PORT = process.env.PORT || 5000;



require('dotenv').config();



// Serve frontend from ../frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'register.html'));
});
// GET ALL USERS
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});  // ✅ Get all documents in 'users' collection
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: "Server error: " + err.message });

    }
});
// Get user by id
app.get('/api/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //     return res.status(400).send("Invalid user ID format.");
        // }
        const found = await User.find({ id: id });
        if (found)
            return res.status(200).json(found);
        else
            return res.status(404).send("Not Found");
    } catch (err) {
        return res.status(500).json({ message: "Server error: " + err.message });

    }
});
// Create Account
app.post('/api/users/newUser', async (req, res) => {
    try {

        const {
            first_name,
            last_name,
            email,
            password,
            gender,
            phone,
            address
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }
        // ✅ Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Save user with hashed password
        const newUser = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            gender,
            phone,
            address
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully." });

    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});
// LOGIN


app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Check if user exists by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email." });
        }

        // ✅ Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid  password." });
        }
        // JWT payload me user info daalo
        const payload = {
            id: user._id,
            email: user.email,
            name: user.first_name
        };


        // ✅ Create token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        // ✅ Send success response
        return res.status(200).json({
            message: "Log in successfully. 🙂",
            token,
            user: payload
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error: " + err.message });

    }
});
app.get('/api/profile', authenticateToken, (req, res) => {
    res.json({ message: "You are authorized", user: req.user });
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});