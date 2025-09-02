const express = require('express');
const { auth, db } = require('../config/firebase');
const router = express.Router();

// Search users by email
router.get('/search', async (req, res) => {
  try {
    const { email } = req.query;
    const userRecord = await auth.getUserByEmail(email);
    
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userData.displayName,
      photoURL: userRecord.photoURL || userData.photoURL
    });
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;
    
    // Update in Firebase Auth
    await auth.updateUser(req.user.uid, {
      displayName,
      photoURL
    });
    
    // Update in Firestore
    await db.collection('users').doc(req.user.uid).set({
      displayName,
      photoURL,
      updatedAt: new Date()
    }, { merge: true });
    
    res.json({ success: true, displayName, photoURL });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;