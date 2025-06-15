const { productRequestEmail } = require("../utils/mailer");
const User = require("../models/User");

const customRequestController = async (req, res) => {
    try {
        const userId = req.userId;
        const customDetails = req.body.customDetails;
        const user = await User.findById(userId);
        const customerName = user.first_name + " " + user.last_name;
        await productRequestEmail({
            customerName: customerName,
            customerEmail: user.email,
            mobile: user.mobile,
            address: user.address,
            customDetails: customDetails
        });
        return res.status(201).json({
            success: true,
            message: `Hi ${customerName} ! Your custom request has been submitted successfully! We will contact you soon.`,
        });
    } catch (error) {
        console.error("Error in customRequestController:", error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};
module.exports = customRequestController;