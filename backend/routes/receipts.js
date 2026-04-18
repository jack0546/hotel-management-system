const express = require('express');
const router = express.Router();
const { generateReceipt } = require('../services/pdfGenerator');
const Booking = require('../models/Booking');

// Generate and send receipt
router.get('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('user').populate('room');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    
    generateReceipt(booking, res);
  } catch (err) {
    res.status(500).send('Server Error generating receipt');
  }
});

module.exports = router;
