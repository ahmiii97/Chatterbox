const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Get messages for a room
router.get('/messages/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const messagesRef = db.collection('messages')
      .where('roomId', '==', roomId)
      .orderBy('timestamp', 'asc');
    
    const snapshot = await messagesRef.get();
    const messages = [];
    
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new chat room
router.post('/rooms', async (req, res) => {
  try {
    const { name, participants } = req.body;
    const roomData = {
      name,
      participants: [...participants, req.user.uid],
      createdAt: new Date(),
      createdBy: req.user.uid
    };
    
    const roomRef = await db.collection('rooms').add(roomData);
    res.json({ id: roomRef.id, ...roomData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's chat rooms
router.get('/rooms', async (req, res) => {
  try {
    const roomsRef = db.collection('rooms')
      .where('participants', 'array-contains', req.user.uid);
    
    const snapshot = await roomsRef.get();
    const rooms = [];
    
    snapshot.forEach(doc => {
      rooms.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;