const Cart = require("../models/Cart");
const mongoose = require('mongoose');

const addToCart = async (req, res) => {
    const userId = req.userId;  // From token
    const productId = req.body.productId;
    console.log(userId + " - " + productId);

    try {
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: 'Invalid userId or productId' });
        }
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // First-time cart creation
            cart = new Cart({
                userId,
                items: [{ product: productId, quantity: 1 }]
            });
        } else {
            // Check if product already exists
            const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

            if (itemIndex > -1) {
                // Product exists, increase quantity
                cart.items[itemIndex].quantity += 1;
            } else {
                // New product
                cart.items.push({ product: productId, quantity: 1 });
            }
        }

        await cart.save();
        return res.status(200).json({ message: "Added to cart", cart });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong : " + err });
    }
};


const getCart = async (req, res) => {
    try {
        const userId = req.userId;

        console.log(userId);

        const cart = await Cart.findOne({ userId }).populate("items.product");
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        return res.json(cart);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" });
    }
};
const removeFromCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.body;
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();

        return res.json({ message: "Item removed", cart });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" + err });
    }
};
const decreaseQuantity = async (req, res) => {
    const userId = req.userId;
    const { productId } = req.body;
    console.log(userId + "-" + productId);

    if (!userId || !productId) {
        return res.status(400).json({ error: "userId and productId are required" });
    }

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ error: "Product not found in cart" });
        }

        if (cart.items[itemIndex].quantity > 1) {
            cart.items[itemIndex].quantity -= 1; // Reduce quantity by 1
        } else {
            cart.items.splice(itemIndex, 1); // Quantity is 1, remove the item
        }

        await cart.save();

        return res.status(200).json({ message: "Quantity updated", cart });
    } catch (error) {
        console.error("Error decreasing quantity:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};




module.exports = { addToCart, getCart, removeFromCart, decreaseQuantity };