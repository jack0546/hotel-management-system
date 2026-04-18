const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Super Admin', 'Hotel Admin', 'Receptionist', 'Restaurant Staff', 'Customer'],
    default: 'Customer'
  },
  phone: String,
  idDocument: String, // URL to uploaded ID
  loyaltyPoints: { type: Number, default: 0 },
  isVip: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
