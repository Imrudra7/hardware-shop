const Order = require('../models/Order'); // make sure path is correct
const Product = require('../models/Product');

const buyController = async (req, res) => {
    try {
        const userId = req.userId;

        console.log("Inside Buy Now Controller : " + userId);
        const cartItems = req.body.cartItems;
        console.log(cartItems + JSON.stringify("cartItems=" + cartItems) + cartItems.length);
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).send("No product is given to buy.Cart is Empty.");
        }
        let totalAmount = 0;

        for (let item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
            }

            totalAmount += product.price * item.quantity;
        }
        console.log(totalAmount);
        // Step 2: Create Order
        const newOrder = new Order({
            userId: userId,
            items: cartItems, // directly use from body
            totalAmount,
            status: "pending",
            paymentStatus: "unpaid"
        });
        console.log("About to save Order: " + newOrder);

        await newOrder.save();

        // Step 3: Return Success
        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: newOrder._id,
            totalAmount: newOrder.totalAmount
        });
    } catch (error) {
        console.error("Inside catch vlock of buy :" + error);

        return res.status(500).json({ error: "Something went wrong" + error });
    }
};
module.exports = { buyController };