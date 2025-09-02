require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); // ADD THIS LINE - you're missing path import

// Temporary: Add this at the top of server.js instead of the require
const admin = require('firebase-admin');

// Replace the Firebase initialization code with this:
let db, auth;
try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL
        };
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });
        
        console.log('Firebase initialized with service account');
    } else {
        // For development without proper credentials, use a mock
        console.log('Firebase environment variables not found, using mock services');
        throw new Error('Firebase config not available');
    }
    
    db = admin.firestore();
    auth = admin.auth();
    
} catch (error) {
    console.log('Using mock Firebase services for development:', error.message);
    
    // Comprehensive mock implementations
    db = {
        collection: (name) => ({
            doc: (id) => ({
                get: () => Promise.resolve({ 
                    exists: false, 
                    data: () => null 
                }),
                set: (data) => {
                    console.log('Mock Firestore set:', name, id, data);
                    return Promise.resolve();
                },
                update: (data) => {
                    console.log('Mock Firestore update:', name, id, data);
                    return Promise.resolve();
                }
            }),
            where: (field, operator, value) => ({
                get: () => Promise.resolve({ 
                    empty: true, 
                    forEach: () => {} 
                })
            }),
            add: (data) => {
                console.log('Mock Firestore add:', name, data);
                return Promise.resolve({ id: 'mock-doc-id' });
            }
        })
    };
    
    auth = {
        verifyIdToken: (token) => {
            console.log('Mock auth verifying token');
            // Simulate a valid user for development
            return Promise.resolve({ 
                uid: 'dev-user-123', 
                email: 'dev@example.com',
                email_verified: true,
                name: 'Developer User'
            });
        }
    };
}

// ✅ ADD THESE LINES HERE — before using `app`
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - MUST come before static files
app.post('/api/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    console.log('Verifying token...');
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user data from Firestore or create if doesn't exist
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      // Create new user in Firestore
      await db.collection('users').doc(decodedToken.uid).set({
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email.split('@')[0],
        createdAt: new Date(),
        lastSeen: new Date()
      });
    } else {
      // Update last seen
      await db.collection('users').doc(decodedToken.uid).update({
        lastSeen: new Date()
      });
    }

    res.json({ 
      success: true, 
      user: { 
        uid: decodedToken.uid, 
        email: decodedToken.email 
      } 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// API to search users
app.get('/api/users/search', async (req, res) => {
  try {
    const { email, token } = req.query;
    console.log('Searching for user:', email);
    
    // Verify token
    await auth.verifyIdToken(token);
    
    // Search for user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (usersSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let userData = null;
    usersSnapshot.forEach(doc => {
      userData = { id: doc.id, ...doc.data() };
    });
    
    res.json(userData);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API to get user info
app.get('/api/user/:uid', async (req, res) => {
  try {
    const { token } = req.query;
    const { uid } = req.params;
    
    console.log('Getting user info for:', uid);
    
    // Verify token
    await auth.verifyIdToken(token);
    
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from public folder - AFTER API routes
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve chat.html at /chat
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Catch-all route for SPA - must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route for SPA - must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', async (token) => {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      socket.userId = decodedToken.uid;
      socket.join(decodedToken.uid); // Join user's personal room
      console.log(`User ${decodedToken.uid} authenticated`);
    } catch (error) {
      console.log('Authentication failed:', error);
      socket.disconnect();
    }
  });

  socket.on('private_message', async (data) => {
    try {
      // Verify sender is authenticated
      if (!socket.userId) return;
      
      const { to, text } = data;
      console.log('Private message from', socket.userId, 'to', to);
      
      // Save message to Firestore
      const messageData = {
        from: socket.userId,
        to,
        text,
        timestamp: new Date(),
        read: false
      };
      
      const messageRef = await db.collection('messages').add(messageData);
      messageData.id = messageRef.id;
      
      // Emit to both sender and receiver
      socket.emit('message_sent', messageData);
      io.to(to).emit('new_message', messageData);
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Login: http://localhost:${PORT}`);
});
