const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('./db'); // Import the database connection

// Route for user registration
router.post('/register', (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Hash the password before saving it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err); // Log the error
      return res.status(500).json({ message: 'Error hashing password', error: err });
    }

    const query = 'INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)';
    connection.query(query, [name, surname, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting user into DB:', err); // Log the error
        return res.status(500).json({ message: 'Error registering user', error: err });
      }
      console.log('User registered successfully:', result);
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// Route for user login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user from DB:', err); // Log the error
      return res.status(500).json({ message: 'Error logging in', error: err });
    }

    if (results.length === 0) {
      console.log('User not found for email:', email); // Log the user not found
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, results[0].password, (err, match) => {
      if (err) {
        console.error('Error comparing passwords:', err); // Log the error
        return res.status(500).json({ message: 'Error logging in', error: err });
      }

      if (!match) {
        console.log('Password mismatch for user:', email); // Log password mismatch
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      console.log('User logged in successfully:', results[0].email);
      res.status(200).json({ message: 'Login successful', user: results[0] });
    });
  });
});

// Route for adding new product to inventory
router.post('/products/add', (req, res) => {
  const { name, description, category, price, quantity } = req.body;

  if (!name || !description || !category || !price || !quantity) {
    return res.status(400).json({ message: 'All product fields are required' });
  }

  const query = 'INSERT INTO products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [name, description, category, price, quantity], (err, result) => {
    if (err) {
      console.error('Error adding product to DB:', err);
      return res.status(500).json({ message: 'Error adding product', error: err });
    }
    console.log('Product added successfully:', result);
    res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  });
});

// Route for updating product details
router.put('/products/update/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;

  if (!name || !description || !category || !price || !quantity) {
    return res.status(400).json({ message: 'All fields are required to update the product' });
  }

  const query = 'UPDATE products SET name = ?, description = ?, category = ?, price = ?, quantity = ? WHERE id = ?';
  connection.query(query, [name, description, category, price, quantity, id], (err, result) => {
    if (err) {
      console.error('Error updating product in DB:', err);
      return res.status(500).json({ message: 'Error updating product', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product updated successfully:', result);
    res.status(200).json({ message: 'Product updated successfully' });
  });
});

// Route for deleting a product
router.delete('/products/delete/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM products WHERE id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting product from DB:', err);
      return res.status(500).json({ message: 'Error deleting product', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product deleted successfully:', result);
    res.status(200).json({ message: 'Product deleted successfully' });
  });
});

// Route for updating product stock quantity (add or remove stock)
router.post('/products/stock/update', (req, res) => {
  const { productId, quantity, action } = req.body; // action can be "add" or "remove"

  if (!productId || !quantity || !action) {
    return res.status(400).json({ message: 'Product ID, quantity, and action are required' });
  }

  if (action !== 'add' && action !== 'remove') {
    return res.status(400).json({ message: 'Invalid action. Use "add" or "remove"' });
  }

  const query = 'SELECT quantity FROM products WHERE id = ?';
  connection.query(query, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product from DB:', err);
      return res.status(500).json({ message: 'Error updating stock', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let updatedQuantity = results[0].quantity;
    if (action === 'add') {
      updatedQuantity += quantity;
    } else if (action === 'remove') {
      if (updatedQuantity < quantity) {
        return res.status(400).json({ message: 'Not enough stock to remove' });
      }
      updatedQuantity -= quantity;
    }

    const updateQuery = 'UPDATE products SET quantity = ? WHERE id = ?';
    connection.query(updateQuery, [updatedQuantity, productId], (err, result) => {
      if (err) {
        console.error('Error updating stock in DB:', err);
        return res.status(500).json({ message: 'Error updating stock', error: err });
      }

      console.log('Product stock updated successfully:', result);
      res.status(200).json({ message: 'Product stock updated successfully', quantity: updatedQuantity });
    });
  });
});

module.exports = router;
