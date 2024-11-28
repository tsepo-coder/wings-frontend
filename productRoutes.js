const express = require('express');
const router = express.Router();
const connection = require('./db'); // Import the database connection

// Route for fetching all products, including stock quantity
router.get('/', (req, res) => {
  const query = 'SELECT * FROM products';
  
  // Run the query to get all products
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ message: 'An error occurred while fetching products' });
    }

    // Check if no products are found
    if (results.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.status(200).json(results); // Return products along with stock levels
  });
});

// Route for adding a new product, including initial quantity
router.post('/', (req, res) => {
  const { name, description, category, price, quantity } = req.body;

  if (!name || !description || !category || !price || !quantity) {
    return res.status(400).json({ message: 'Please provide name, description, category, price, and quantity for the product.' });
  }

  const query = 'INSERT INTO products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)';
  
  connection.query(query, [name, description, category, price, quantity], (err, results) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).json({ message: 'An error occurred while adding the product' });
    }

    res.status(201).json({ message: 'Product added successfully', productId: results.insertId });
  });
});

// Route for updating product details, including stock quantity
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;

  if (!name || !description || !category || !price || !quantity) {
    return res.status(400).json({ message: 'Please provide all required fields to update the product.' });
  }

  const query = 'UPDATE products SET name = ?, description = ?, category = ?, price = ?, quantity = ? WHERE id = ?';

  connection.query(query, [name, description, category, price, quantity, id], (err, results) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ message: 'An error occurred while updating the product' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully' });
  });
});

// Route for deleting a product
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM products WHERE id = ?';

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ message: 'An error occurred while deleting the product' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  });
});

// Route for updating product stock quantity (add/subtract stock)
router.post('/stock/:id', (req, res) => {
  const { id } = req.params;
  const { quantity, type } = req.body; // 'type' could be 'add' or 'subtract'

  if (!quantity || !type) {
    return res.status(400).json({ message: 'Please provide quantity and transaction type (add/subtract).' });
  }

  const query = 'SELECT quantity FROM products WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching product stock:', err);
      return res.status(500).json({ message: 'An error occurred while fetching product stock' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let newQuantity = results[0].quantity;

    // Add or subtract stock based on transaction type
    if (type === 'add') {
      newQuantity += quantity;
    } else if (type === 'subtract') {
      newQuantity -= quantity;
    } else {
      return res.status(400).json({ message: 'Invalid transaction type. Use "add" or "subtract".' });
    }

    const updateQuery = 'UPDATE products SET quantity = ? WHERE id = ?';
    connection.query(updateQuery, [newQuantity, id], (err) => {
      if (err) {
        console.error('Error updating stock:', err);
        return res.status(500).json({ message: 'An error occurred while updating stock' });
      }

      res.status(200).json({ message: 'Stock updated successfully', newQuantity });
    });
  });
});

module.exports = router;
