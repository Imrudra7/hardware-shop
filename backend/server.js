const express = require('express');
const connectDB = require('./db');
const path = require('path');


const app = express();
connectDB();

app.get("/", (req, res) => {
  res.send("MongoDB Connected!");
});

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


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});