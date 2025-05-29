require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const path = require('path');
const User = require('./models/User');
const Product = require('./models/Product');
const productRoutes = require("./routes/productRoutes");

const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//const token = jwt.sign({ userId: User._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
// Secret key (isse safe jagah environment variable mein store karo)
const JWT_SECRET = process.env.JWT_SECRET || '7b6f7cae484a1e2438f752ffbce701cd203891908d22406dbefc7e2127046d06';
if (!JWT_SECRET) {
    console.log(JWT_SECRET);
    throw new Error("JWT_SECRET environmental variable is not defined");
} else {
    console.log(JWT_SECRET);

}
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log("Auth Header received:", authHeader);

    if (!authHeader) {
        console.log("No Authorization header present! URL:", req.originalUrl);
        return res.status(401).json({ message: "Access token missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log("Token missing in Authorization header! URL:", req.originalUrl);
        return res.status(401).json({ message: "Access token missing" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("JWT verification error:", err);
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        console.log("Token verified, user:", user);
        req.user = user;
        next();
    });
}





const app = express();
app.use(express.json());
app.use(cors()); // ⬅️ Allow frontend to access backend
app.use(productRoutes);
connectDB();

const PORT = process.env.PORT || 5000;




function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next(); // ✅ allowed
    } else {
        return res.status(403).json({ message: "Access denied: Admins only 🚫" });
    }
}



// Serve frontend from ../frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static('uploads'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'register.html'));
});
// app.get('/admin-dashboard', authenticateToken, isAdmin, (req, res) => {
//     return res.sendFile(path.join(__dirname, '../frontend/admin/admin-dashboard.html'));
// });
// This should be in app.js or routes file where static files are served
app.get("/admin-dashboard", (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(401).send("Unauthorized: No token");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== "admin") {
            return res.status(403).send("Forbidden: Invalid admin");
        }

        return res.sendFile(path.join(__dirname, "../frontend/admin/admin-dashboard.html"));
    });
});
app.get("/addProduct", (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(401).send("Unauthorized: No token");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== "admin") {
            return res.status(403).send("Forbidden: Invalid admin");
        }

        return res.sendFile(path.join(__dirname, '../frontend/admin/addProduct.html'));
    });
});
// app.get('/addProduct', authenticateToken, isAdmin, (req, res) => {
//     return res.sendFile(path.join(__dirname, '../frontend/admin/addProduct.html'));
// });
// GET ALL USERS
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});  // ✅ Get all documents in 'users' collection
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: "Server error: " + err.message });

    }
});
// // Get user by id
// app.get('/api/users/:id', async (req, res) => {
//     try {
//         const id = req.params.id;
//         // if (!mongoose.Types.ObjectId.isValid(id)) {
//         //     return res.status(400).send("Invalid user ID format.");
//         // }
//         const found = await User.find({ id: id });
//         if (found)
//             return res.status(200).json(found);
//         else
//             return res.status(404).send("Not Found");
//     } catch (err) {
//         return res.status(500).json({ message: "Server error: " + err.message });

//     }
// });
app.post('/api/users/newUser', async (req, res) => {
    try {
        let {
            first_name,
            last_name,
            email,
            password,
            gender,
            phone,
            address
        } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        first_name = first_name.trim();
        last_name = last_name.trim();
        email = email.trim().toLowerCase();
        gender = gender?.trim();
        address = address?.trim();
        const mobile = phone?.trim(); // ✅ Correct assignment

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            gender,
            mobile,
            address
        });

        await newUser.save();

        return res.status(201).json({ message: "User registered successfully." });

    } catch (err) {
        console.error("User registration error:", err);
        return res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

// LOGIN

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;  // <-- here, change dbEmail to email

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ message: "Invalid email." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.first_name
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

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
    return res.json({ message: "You are authorized", user: req.user });
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});