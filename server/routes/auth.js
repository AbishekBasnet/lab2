const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Registration
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  // Validate email
  const emailRegex = /^(?:[a-zA-Z0-9_'^&+%$#!?{}~`|\/-]+)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  // Validate password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters, include uppercase, lowercase, and a digit.' });
  }
  // Validate phone
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Phone number must be a valid 10-digit North American number.' });
  }
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[Register] Error: Email already registered.');
      return res.status(400).json({ error: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name, phone });
    await user.save();
    res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      console.log('[Register] ValidationError:', messages.join(' '));
      return res.status(400).json({ error: messages.join(' ') });
    }
    // Log and return the error message if available, otherwise a generic message
    console.log('[Register] Unexpected error:', err.message || err);
    return res.status(500).json({ error: err.message || 'Registration failed due to an unknown error.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { email: user.email, name: user.name, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

module.exports = router;
