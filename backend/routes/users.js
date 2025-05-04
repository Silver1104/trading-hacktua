// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { firebaseUID, email, displayName, phoneNumber, authProvider } = req.body;
    
    // Check if user exists with same email but different auth provider
    const existingUserDifferentProvider = await User.findOne({ 
      email, 
      firebaseUID: { $ne: firebaseUID },
      authProvider: { $ne: authProvider }
    });

    if (existingUserDifferentProvider) {
      // Update the existing user with the new auth provider info
      existingUserDifferentProvider.firebaseUID = firebaseUID;
      existingUserDifferentProvider.authProvider = authProvider;
      if (displayName) existingUserDifferentProvider.displayName = displayName;
      if (phoneNumber) existingUserDifferentProvider.phoneNumber = phoneNumber;
      
      await existingUserDifferentProvider.save();
      return res.status(200).json(existingUserDifferentProvider);
    }
    
    // Check if user already exists with same firebaseUID
    const existingUser = await User.findOne({ firebaseUID });
    
    if (existingUser) {
      // Update existing user
      if (email) existingUser.email = email;
      if (displayName) existingUser.displayName = displayName;
      if (phoneNumber) existingUser.phoneNumber = phoneNumber;
      if (authProvider) existingUser.authProvider = authProvider;
      
      await existingUser.save();
      return res.status(200).json(existingUser);
    }
    
    // Create new user
    const newUser = new User({
      firebaseUID,
      email,
      displayName: displayName || '',
      phoneNumber: phoneNumber || '',
      authProvider
    });
    
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by Firebase UID
router.get('/:firebaseUID', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.params.firebaseUID });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user data
router.put('/:firebaseUID', async (req, res) => {
  try {
    const { userData } = req.body;
    
    const user = await User.findOne({ firebaseUID: req.params.firebaseUID });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update userData field
    user.userData = { ...user.userData, ...userData };
    
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;