const nodemailer = require('nodemailer');
require('dotenv').config(); // Load env vars

// ✅ Setup transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.VSEMAIL,
        pass: process.env.VSPASS
    }
});

// ✅ Send mail function
const sendOrderEmails = async ({ customerName, customerEmail, orderItems, totalAmount, mobile, address }) => {
    console.log("📨 Inside sendOrderEmails with data:", customerName, customerEmail, orderItems, totalAmount, mobile, address);
    const firstName = customerName ? customerName.split(" ")[0] : "Customer";
    const mailToUser = {
        from: process.env.VSEMAIL,
        to: customerEmail,
        subject: 'VS STEEL : Order Placed',
        text:
            `Dear ${customerName},

Thank you for placing your order with VS Steel. We truly appreciate your trust in our craftsmanship and commitment to quality.

🧾 Order Summary:
${orderItems.map(item => `• ${item.name} x ${item.qty} = ₹${item.price * item.qty}`).join('\n')}

----------------------------------------
Total Amount Payable: ₹${totalAmount}
----------------------------------------

Our team will contact you shortly to confirm the order and delivery details.

If you have any queries, feel free to reach out to us at vssteel.support@gmail.com.

Thank you once again for choosing VS Steel.

Warm regards,  
Team VS Steel
`

    };

    const mailToAdmin = {
        from: process.env.VSEMAIL,
        to: process.env.ADMINEMAIL, // Replace with actual admin email
        subject: '📥 New Order Received!',
        text:
            `📦 New Order Placed!

Customer Details:
👤 Name: ${customerName}
📧 Email: ${customerEmail}
📱 Mobile: ${mobile}
🏠 Address: ${address}

🧾 Order Summary:
${orderItems.map(item => `• ${item.name} x ${item.qty}`).join('\n')}

----------------------------------------
Total Amount: ₹${totalAmount}
----------------------------------------

Please follow up with the customer to confirm and process the order.

Regards,  
VS Steel Notifications`


    };
    console.log("About to send ");

    await transporter.sendMail(mailToUser);
    await transporter.sendMail(mailToAdmin);
};

module.exports = sendOrderEmails;
