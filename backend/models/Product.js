const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: String,
        enum: ["Steel", "Aluminium", "UPVC"],
        required: true,
    },
    subCategory: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    weight: {
        type: String,
        required: true,
    },
    dimensions: {
        length: { type: String, default: null },
        breadth: { type: String, default: null },
        height: { type: String, default: null },
    },
    material: {
        type: String,
        default: null,
    },
    color: {
        type: String,
        default: null,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    imageAlt: {
        type: String,
        default: null,
    },
    quantityInStock: {
        type: Number,
        required: true,
    },
    sold: {
        type: Number,
        default: 0,
    },
    available: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
