const express = require('express');
const router = express.Router();
const {
    addToCart,
    getCart,
    removeFromCart,
    decreaseQuantity
    // updateQuantity,
} = require('../controllers/cartController');

const authMiddleware = require('../middleware/authMiddleware'); // JWT ya token check karne ke liye

// Routes
router.post('/addtocart', authMiddleware, addToCart);
router.get('/getcart/:userId', authMiddleware, getCart);
// router.get('/:userId', getCart);

router.post('/removefromcart', authMiddleware, removeFromCart);
router.post('/decreasequantity', authMiddleware, decreaseQuantity);
// router.post('/update', authMiddleware, updateQuantity);

module.exports = router;
