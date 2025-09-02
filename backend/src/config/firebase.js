const admin = require('firebase-admin');

// Check if Firebase is already initialized
let db, auth;

try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        const firebaseConfig = {
            apiKey: "AIzaSyBmccMP9WXl4G-Qpcg8q9F-3X_02TamTiE",
            authDomain: "chatter-3e579.firebaseapp.com",
            projectId: "chatter-3e579",
            storageBucket: "chatter-3e579.firebasestorage.app",
            messagingSenderId: "364669673603",
            appId: "1:364669673603:web:80e8399026d7b5d298bbb6",
            measurementId: "G-4RDSY633B1"
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        console.log('Using default Firebase configuration');
        admin.initializeApp();
    }

    db = admin.firestore();
    auth = admin.auth();
    console.log('Firebase initialized successfully');

} catch (error) {
    console.error('Firebase init error:', error);
    
    // Mock implementations for development
    db = {
        collection: () => ({
            doc: () => ({
                get: () => Promise.resolve({ exists: false, data: () => null }),
                set: () => Promise.resolve(),
                update: () => Promise.resolve()
            }),
            where: () => ({
                get: () => Promise.resolve({ empty: true, forEach: () => {} })
            })
        })
    };
    
    auth = {
        verifyIdToken: (token) => Promise.resolve({ 
            uid: 'dev-user-id', 
            email: 'dev@example.com' 
        })
    };
}

module.exports = { admin, db, auth };