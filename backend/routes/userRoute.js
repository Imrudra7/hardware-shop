const express = require("express");
const router = express.Router();
const User = require("../models/User");
const customRequestController = require("../controllers/customRequestController");
const authMiddleware = require("../middleware/authMiddleware"); // your JWT middleware

// GET /api/users/me
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("first_name last_name email mobile");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/custom-request", authMiddleware, customRequestController);

module.exports = router;
