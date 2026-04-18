const express = require('express');
const router = express.Router();
const { MenuItem, POSOrder } = require('../models/POS');

// Get all menu items
router.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true });
    res.json(items);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create POS Order
router.post('/order', async (req, res) => {
  try {
    const order = new POSOrder(req.body);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
