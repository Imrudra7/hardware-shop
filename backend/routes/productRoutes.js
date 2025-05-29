const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require('../models/Product');

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
router.post("/api/addproduct", upload.single("image"), async (req, res) => {

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

module.exports = router;
