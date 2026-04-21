const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { sendWhatsAppNotification } = require('../services/whatsapp');
const auth = require('../middleware/auth');

// Input validation helpers
function validateDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date instanceof Date && !isNaN(date) && date >= now;
}

function validateAmount(amount) {
  return typeof amount === 'number' && amount > 0 && amount <= 50000; // Max 50,000 GHS
}

function sanitizePhone(phone) {
  if (typeof phone !== 'string') return '';
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 9 && cleaned.length <= 15 ? cleaned : '';
}

// Create Booking - SECURED
router.post('/', auth, async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, totalAmount, userPhone, userName, roomType } = req.body;

    // Input validation
    if (!mongoose.Types.ObjectId.isValid(room)) {
      return res.status(400).json({ msg: 'Invalid room ID' });
    }

    if (!validateDate(checkInDate) || !validateDate(checkOutDate)) {
      return res.status(400).json({ msg: 'Invalid dates provided' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return res.status(400).json({ msg: 'Check-out date must be after check-in date' });
    }

    // Maximum stay limit (30 days)
    const maxStay = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (checkOut - checkIn > maxStay) {
      return res.status(400).json({ msg: 'Maximum stay duration is 30 days' });
    }

    if (!validateAmount(totalAmount)) {
      return res.status(400).json({ msg: 'Invalid booking amount' });
    }

    // Verify room exists and is available
    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    if (roomDoc.status === 'Occupied') {
      return res.status(400).json({ msg: 'Room is currently occupied' });
    }

    // Enhanced booking conflict check
    const conflictingBooking = await Booking.findOne({
      room,
      status: { $in: ['Pending', 'Confirmed', 'CheckedIn'] },
      $or: [
        {
          $and: [
            { checkInDate: { $lt: checkOut } },
            { checkOutDate: { $gt: checkIn } }
          ]
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(409).json({
        msg: 'Room is not available for the selected dates',
        available: false
      });
    }

    // Sanitize inputs
    const sanitizedPhone = sanitizePhone(userPhone);
    const sanitizedName = (userName || '').substring(0, 100).trim();
    const sanitizedRoomType = (roomType || '').substring(0, 50).trim();

    // Create booking
    const booking = new Booking({
      user: req.user.id, // Use authenticated user ID
      room,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalAmount,
      status: 'Pending', // Start as pending until payment
      paymentStatus: 'Pending'
    });

    await booking.save();

    // Update room status to reserved
    await Room.findByIdAndUpdate(room, { status: 'Reserved' });

    // Send WhatsApp notifications (only if phone provided)
    if (sanitizedPhone) {
      try {
        await sendWhatsAppNotification(
          sanitizedPhone,
          `Hello ${sanitizedName}, your booking for ${sanitizedRoomType} is pending payment. Check-in: ${checkIn.toDateString()}`
        );
      } catch (waError) {
        console.warn('WhatsApp notification to guest failed:', waError.message);
      }

      try {
        await sendWhatsAppNotification(
          '+233532340875',
          `🚨 NEW BOOKING - Safegold Hotel\n\nGuest: ${sanitizedName}\nRoom: ${sanitizedRoomType}\nPhone: ${sanitizedPhone}\nDates: ${checkIn.toDateString()} to ${checkOut.toDateString()}\nTotal: GHS ${totalAmount}\nStatus: Pending Payment`
        );
      } catch (waError) {
        console.warn('WhatsApp notification to owner failed:', waError.message);
      }
    }

    // Populate booking data for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('room', 'roomNumber type');

    res.status(201).json({
      success: true,
      booking: populatedBooking,
      message: 'Booking created successfully. Please complete payment.'
    });

  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ msg: 'Server error creating booking' });
  }
});

// Get Bookings - SECURED
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    // Regular users can only see their own bookings
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    // Add filtering options
    const { status, room, limit = 50, skip = 0 } = req.query;

    if (status && ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'].includes(status)) {
      query.status = status;
    }

    if (room && mongoose.Types.ObjectId.isValid(room)) {
      query.room = room;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('room', 'roomNumber type price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ msg: 'Server error fetching bookings' });
  }
});

module.exports = router;
