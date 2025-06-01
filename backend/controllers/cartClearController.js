const Cart = require('../models/Cart');

const cartClearController = async (req, res) => {
    try {
        const userId = req.userId;

        // Remove all cart items for this user
        await Cart.deleteMany({ userId });


        // Step 3: Return Success
        return res.status(201).json({
            success: true,
            message: "Cart cleared",
        });
    } catch (error) {
        console.error("Inside catch vlock of buy :" + error);

        return res.status(500).json({ error: "Something went wrong" + error });
    }
};
module.exports = { cartClearController };