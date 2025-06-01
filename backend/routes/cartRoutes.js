const express = require('express');
const router = express.Router();
const {
    addToCart,
    getCart,
    removeFromCart,
    decreaseQuantity

    // updateQuantity,
} = require('../controllers/cartController');
const { buyController } = require('../controllers/buyController');
const { cartClearController } = require('../controllers/cartClearController');

const authMiddleware = require('../middleware/authMiddleware'); // JWT ya token check karne ke liye

// Routes
router.post('/addtocart', authMiddleware, addToCart);
router.get('/getcart', authMiddleware, getCart);
router.delete('/clear', authMiddleware, cartClearController);
// router.get('/:userId', getCart);

router.post('/removefromcart', authMiddleware, removeFromCart);
router.post('/decreasequantity', authMiddleware, decreaseQuantity);
// router.post('/update', authMiddleware, updateQuantity);

router.post('/buy-now', authMiddleware, buyController);
module.exports = router;
