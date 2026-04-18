const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Get all rooms (with filters)
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    
    const rooms = await Room.find(query);
    res.json(rooms);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create a room (Admin only theoretically)
router.post('/', async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    const room = await newRoom.save();
    res.json(room);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
