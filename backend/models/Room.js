const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['Single', 'Double', 'Deluxe', 'Executive', 'Suite', 'Presidential Suite'],
    required: true 
  },
  capacity: { type: Number, required: true },
  pricePerNight: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'],
    default: 'Available'
  },
  images: [String],
  description: String,
  amenities: [String]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
