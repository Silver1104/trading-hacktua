// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'phone'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Add any additional user data you want to store
  userData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Create a compound index to ensure users with the same email from different providers are treated properly
UserSchema.index({ email: 1, authProvider: 1 });

module.exports = mongoose.model('User', UserSchema);