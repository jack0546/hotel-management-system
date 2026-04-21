const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { generateReceipt } = require('../services/pdfGenerator');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Generate and send receipt - SECURED ENDPOINT
router.get('/:bookingId', auth, async (req, res) => {
  try {
    // Validate bookingId format to prevent injection
    if (!mongoose.Types.ObjectId.isValid(req.params.bookingId)) {
      return res.status(400).json({ msg: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(req.params.bookingId)
      .populate('user', 'name email')
      .populate('room', 'roomNumber type');

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Authorization check: users can only access their own bookings
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Only allow receipt generation for completed/paid bookings
    if (booking.paymentStatus !== 'Paid' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Receipt only available for paid bookings' });
    }

    generateReceipt(booking, res);
  } catch (err) {
    console.error('Receipt generation error:', err);
    res.status(500).json({ msg: 'Server error generating receipt' });
  }
});

module.exports = router;
