const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Input validation helper
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validatePassword(password) {
  // Require at least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password) && password.length <= 128;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, 100);
}

// Register with enhanced security
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Input validation and sanitization
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = email.toLowerCase().trim();

    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({ msg: 'Name must be at least 2 characters long' });
    }

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ msg: 'Please provide a valid email address' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        msg: 'Password must be at least 8 characters with uppercase, lowercase, and number'
      });
    }

    // Check for existing user
    let user = await User.findOne({ email: sanitizedEmail });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Validate role
    const allowedRoles = ['user', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    // Hash password with higher cost for better security
    const saltRounds = 14;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user = new User({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: userRole
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      console.error('WARNING: JWT_SECRET not properly configured');
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    jwt.sign(payload, jwtSecret, { expiresIn: '24h' }, (err, token) => {
      if (err) {
        console.error('JWT signing error:', err);
        return res.status(500).json({ msg: 'Authentication error' });
      }
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      });
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// Login with enhanced security and rate limiting consideration
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    const sanitizedEmail = email.toLowerCase().trim();

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ msg: 'Please provide a valid email address' });
    }

    if (!password || password.length < 1) {
      return res.status(400).json({ msg: 'Password is required' });
    }

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      console.error('WARNING: JWT_SECRET not properly configured');
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    jwt.sign(payload, jwtSecret, { expiresIn: '24h' }, (err, token) => {
      if (err) {
        console.error('JWT signing error:', err);
        return res.status(500).json({ msg: 'Authentication error' });
      }
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

module.exports = router;
