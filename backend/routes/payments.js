const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// Mock payment endpoint
router.post('/charge', async (req, res) => {
  try {
    const { bookingId, amount, token } = req.body;
    
    // In real app, integrate via Stripe intents
    // const charge = await stripe.charges.create({ ... });
    
    // Update booking payment status
    const booking = await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'Paid' }, { new: true });
    
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).send('Payment Error');
  }
});

module.exports = router;
