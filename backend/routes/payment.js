const Razorpay = require("razorpay");
const express = require("express");
const Product = require("../models/Product"); // adjust if path differs
const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order: Handles both single and multiple product buy
router.post("/create-order", async (req, res) => {
    const { cartItems } = req.body; // Expect array: [{ productId, quantity }]

    try {
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "cartItems is required and should not be empty" });
        }

        let totalAmount = 0;

        for (const item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
            }
            totalAmount += product.price * (item.quantity || 1);
        }

        const options = {
            amount: totalAmount * 100, // in paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        return res.json({ success: true, order });

    } catch (err) {
        console.error("Order creation error:", err);
        return res.status(500).json({ success: false, message: "Order creation failed", error: err.message });
    }
});

module.exports = router;
