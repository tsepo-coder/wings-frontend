// stockRoutes.js

const express = require('express');
const router = express.Router();

// Example route for updating stock transactions
router.post('/:id', (req, res) => {
  const { id } = req.params;
  const { quantity, type } = req.body; // 'type' could be 'add' or 'subtract'

  if (!quantity || !type) {
    return res.status(400).json({ message: 'Please provide quantity and transaction type (add/subtract).' });
  }

  // Simulate stock update (replace with actual DB logic)
  let newQuantity = 100; // Example value (you would fetch this from the DB)
  if (type === 'add') {
    newQuantity += quantity;
  } else if (type === 'subtract') {
    newQuantity -= quantity;
  } else {
    return res.status(400).json({ message: 'Invalid transaction type' });
  }

  // Send back the updated stock quantity
  res.status(200).json({ message: 'Stock updated successfully', newQuantity });
});

module.exports = router;
