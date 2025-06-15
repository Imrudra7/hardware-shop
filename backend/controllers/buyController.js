// const Order = require('../models/Order'); // make sure path is correct
// const Product = require('../models/Product');
// const sendOrderEmails = require('../utils/mailer'); // ✅ Import mailer
// const User = require('../models/User'); // ✅ Check the correct path

// const buyController = async (req, res) => {
//     try {
//         const userId = req.userId;

//         console.log("Inside Buy Now Controller : " + userId);
//         const cartItems = req.body.cartItems;
//         console.log(cartItems + JSON.stringify("cartItems=" + cartItems) + cartItems.length);
//         if (!cartItems || cartItems.length === 0) {
//             return res.status(400).send("No product is given to buy.Cart is Empty.");
//         }
//         let totalAmount = 0;
//         const orderItems = [];
//         for (let item of cartItems) {
//             const product = await Product.findById(item.productId);
//             if (!product) {
//                 return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
//             }

//             totalAmount += product.price * item.quantity;
//             orderItems.push({
//                 name: product.name,
//                 qty: item.quantity,
//                 price: product.price,
//             });
//         }
//         console.log(totalAmount);
//         // Step 2: Create Order
//         const newOrder = new Order({
//             userId: userId,
//             items: cartItems, // directly use from body
//             totalAmount,
//             status: "pending",
//             paymentStatus: "unpaid"
//         });
//         console.log("About to save Order: " + newOrder);

//         await newOrder.save();
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }
//         console.log(user);
//         console.log("📨 About to call sendOrderEmails");
//         await sendOrderEmails({
//             customerName: user.first_name + " " + user.last_name,            // ✅ Name from DB
//             customerEmail: user.email,          // ✅ Email from DB
//             orderItems,
//             totalAmount: totalAmount,
//             mobile: user.mobile,
//             address: user.address
//         });

//         // Step 3: Return Success
//         return res.status(201).json({
//             success: true,
//             message: "Order placed successfully",
//             orderId: newOrder._id,
//             totalAmount: newOrder.totalAmount
//         });
//     } catch (error) {
//         console.error("Inside catch vlock of buy :" + error);

//         return res.status(500).json({ error: "Something went wrong" + error });
//     }
// };
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderEmails } = require('../utils/mailer');
const User = require('../models/User');
const crypto = require("crypto"); // To verify signature if needed

const buyController = async (req, res) => {
    try {
        const userId = req.userId;
        const { cartItems, paymentId, orderId, signature } = req.body;
        if (!paymentId || !orderId || !signature) {
            return res.status(400).json({ error: "Missing Razorpay payment details" });
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty." });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (let item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${item.productId} not found` });
            }

            totalAmount += product.price * item.quantity;
            orderItems.push({
                name: product.name,
                qty: item.quantity,
                price: product.price,
            });
        }

        // ✅ Optional Razorpay signature verification (recommended for security)
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(orderId + "|" + paymentId)
            .digest("hex");

        if (generatedSignature !== signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // ✅ Create Order
        const newOrder = new Order({
            userId,
            items: cartItems,
            totalAmount,
            status: "confirmed",
            paymentStatus: "paid",
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            razorpaySignature: signature
        });


        await newOrder.save();

        // ✅ Send confirmation email
        const user = await User.findById(userId);
        await sendOrderEmails({
            customerName: user.first_name + " " + user.last_name,
            customerEmail: user.email,
            orderItems,
            totalAmount,
            mobile: user.mobile,
            address: user.address
        });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: newOrder._id
        });

    } catch (error) {
        console.error("Error in buyController:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

module.exports = { buyController };