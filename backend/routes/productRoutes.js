const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require('../models/Product');
const app = express();
const cors = require('cors');
app.use(cors());
const jwt = require("jsonwebtoken");

// Middleware to verify token and admin role
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ success: false, message: "Access token missing" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Access token missing" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET must be set in env
        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied: Admins only" });
        }
        req.user = decoded; // attach user info to request object
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
};

// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/ProductImages");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Helper to auto-generate productId
const generateProductId = (category, subCategory, productName) => {
    const timestamp = Date.now();
    return `${category}-${subCategory}-${productName}`
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "") + `-${timestamp}`;
};

// const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// ✅ Helper to delete uploaded file if needed
const deleteUploadedFile = (filename) => {
    const filePath = path.join(__dirname, "../uploads/ProductImages", filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// Add Product Endpoint with image upload
router.post("/api/addproduct", verifyAdmin, upload.single("image"), async (req, res) => {

    const BASE_URL = `${req.protocol}://${req.get("host")}`;

    const uploadedFileName = req.file?.filename;

    try {
        const {
            name,
            category,
            subCategory,
            description,
            price,
            size,
            weight,
            length,
            breadth,
            height,
            material,
            color,
            imageAlt,
            quantityInStock,
            sold,
            available,
        } = req.body;

        // ✅ Basic validation
        if (!name || !category || !subCategory || !price || !quantityInStock) {
            if (uploadedFileName) deleteUploadedFile(uploadedFileName);
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const productId = generateProductId(category, subCategory, name);

        const imageUrl = req.file
            ? `${BASE_URL}/uploads/ProductImages/${uploadedFileName}`
            : null;



        const newProduct = new Product({
            id: productId,
            name,
            category,
            subCategory,
            description,
            price,
            size,
            weight,
            dimensions: {
                length: length || null,
                breadth: breadth || null,
                height: height || null
            },
            material: material || null,
            color: color || null,
            imageUrl,
            imageAlt: imageAlt || `${name} - ${category} ${subCategory}`,

            quantityInStock: Number(quantityInStock),
            sold: sold ? Number(sold) : 0,
            available: available !== undefined ? (available === "true" || available === true) : true,
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: "Product added", productId });

    } catch (error) {
        if (uploadedFileName) deleteUploadedFile(uploadedFileName);
        res.status(500).json({ success: false, error: error.message });
    }
});
// In routes/middleware or routes/admin.js or wherever
//const jwt = require("jsonwebtoken");

router.get("/api/verify-admin", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        return res.status(200).json({ success: true, message: "Admin verified" });
    });
});

module.exports = router;
