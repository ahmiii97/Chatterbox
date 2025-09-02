const express = require('express');
const { auth } = require('../config/firebase');
const router = express.Router();

// Verify token endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = await auth.verifyIdToken(token);
    res.json({ 
      uid: decodedToken.uid, 
      email: decodedToken.email,
      name: decodedToken.name 
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    const userRecord = await auth.getUser(decodedToken.uid);
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;