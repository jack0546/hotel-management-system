const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'Main Course', 'Beverage', 'Dessert'
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  image: String
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

const posOrderSchema = new mongoose.Schema({
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, default: 1 },
    priceAtTime: { type: Number }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Preparing', 'Served', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'ChargedToRoom'], default: 'Pending' },
  assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // If charged to room
  servedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Restaurant Staff
}, { timestamps: true });

const POSOrder = mongoose.model('POSOrder', posOrderSchema);

module.exports = { MenuItem, POSOrder };
