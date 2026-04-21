const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Input validation helpers
function validateAmount(amount) {
  return typeof amount === 'number' && amount > 0 && amount <= 10000; // Max 10,000
}

function validateBookingId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Secure payment endpoint
router.post('/charge', auth, async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    // Input validation
    if (!validateBookingId(bookingId)) {
      return res.status(400).json({ msg: 'Invalid booking ID' });
    }

    if (!validateAmount(amount)) {
      return res.status(400).json({ msg: 'Invalid payment amount' });
    }

    // Validate payment method
    const allowedMethods = ['card', 'mobile_money', 'cash'];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ msg: 'Invalid payment method' });
    }

    // Find and validate booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Authorization check
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Prevent double payment
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ msg: 'Booking already paid' });
    }

    // Amount validation
    if (Math.abs(booking.totalAmount - amount) > 0.01) {
      return res.status(400).json({ msg: 'Payment amount does not match booking total' });
    }

    // In production, integrate with actual payment processor (Stripe, Paystack, etc.)
    // For now, simulate payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for testing

    if (!paymentSuccess) {
      return res.status(402).json({ msg: 'Payment failed - please try again' });
    }

    // Update booking with payment details
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'Paid',
        paymentMethod: paymentMethod,
        paidAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email').populate('room', 'roomNumber type');

    // Log successful payment (avoid logging sensitive data)
    console.log(`Payment successful: Booking ${bookingId}, Amount: ${amount}, Method: ${paymentMethod}`);

    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Payment processed successfully'
    });

  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({ msg: 'Payment processing failed' });
  }
});

module.exports = router;
