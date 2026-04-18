const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { sendWhatsAppNotification } = require('../services/whatsapp');
const { generateReceipt } = require('../services/pdfGenerator');

// Create Booking
router.post('/', async (req, res) => {
  try {
    const { user, room, checkInDate, checkOutDate, totalAmount } = req.body;
    
    // Check if room is already booked for these dates (simplified logic)
    const existing = await Booking.findOne({
      room,
      $or: [
        { checkInDate: { $lte: checkOutDate }, checkOutDate: { $gte: checkInDate } }
      ],
      status: { $nin: ['Cancelled'] }
    });

    if (existing) {
      return res.status(400).json({ msg: 'Room is already booked for these dates' });
    }

    const booking = new Booking({
      user, room, checkInDate, checkOutDate, totalAmount, status: 'Confirmed'
    });
    
    await booking.save();
    
    // Update room status
    await Room.findByIdAndUpdate(room, { status: 'Reserved' });

    // Send WhatsApp notification
    await sendWhatsAppNotification(req.body.userPhone, `Hello, your booking for Room is confirmed! Check-in: ${checkInDate}`);

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get Bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email').populate('room', 'roomNumber type');
    res.json(bookings);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
