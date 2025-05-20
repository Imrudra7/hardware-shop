const express = require('express');
const connectDB = require('./db');
const path = require('path');
const User = require('./models/User');
const mongoose = require('mongoose');
const cors = require('cors');


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
        return res.status(500).send("Server error: " + err.message);
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
        return res.status(500).send("Server error : " + err);
    }
});
// Create Account
app.post('/api/users/newUser', async (req, res) => {
    try {
        const newUser = req.body;

        const exists = await User.findOne({ email: newUser.email });
        if (exists) {
            return res.status(409).json({ message: "User already exists with this email." }); // 409 = Conflict
        }

        await User.create(newUser);
        return res.status(201).json({
            message: `New user with email ${newUser.email} has been created.`,
            user: newUser
        });
    } catch (err) {
        return res.status(500).send("Server error : " + err);
    }
});
// LOGIN
app.post('/api/users/login', async (req, res) => {
    console.log("BODY:", req.body);
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });

        if (user) {
            return res.status(200).json({
                message: "Log in successfully. 🙂",
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.first_name
                }
            });
        }

        return res.status(409).json({ message: "User doesn't exist with this email or password." });
    } catch (err) {
        return res.status(500).send("Server error : " + err);
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});