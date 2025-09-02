# 📬 Chatterbox

**Chatterbox** is a real-time Instant Messaging (IM) application that connects directly with email services, allowing users to send and receive messages via a chat interface that is backed by email. It uses **Firebase Authentication** for secure user login and identity management, and is built on **Node.js** for scalable server-side logic.

This project is also structured with future support for a **React Native** mobile frontend.

---

## 🚀 Features

- 🔐 Firebase Authentication (Email/Password, Google Sign-In, etc.)
- 📧 Email-based messaging integration (e.g., via Gmail SMTP or similar)
- 📱 Designed with mobile expansion in mind using React Native
- 🌐 RESTful API structure with extensible routing
- 🛡️ Secure authentication and message routing
- 🗂️ Modular and scalable project structure

---

## 🛠️ Tech Stack

| Layer       | Technology            |
|-------------|------------------------|
| Backend     | Node.js, Express       |
| Auth        | Firebase Authentication|
| Email       | Nodemailer or similar  |
| Database    | (optional: Firestore, MongoDB) |
| Mobile UI   | React Native (planned) |

---

## 📦 Prerequisites

Make sure the following are installed:

- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- Firebase Project & credentials
- SMTP email account (e.g., Gmail)
- (Optional) React Native CLI (for mobile development)

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chatterbox.git
cd chatterbox

2. Install Dependencies

npm install
# or
yarn install

3. Configure Environment Variables

Create a .env file in the root directory with the following variables:

FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key

EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

    ⚠️ Be sure to escape \n characters in the private key if using .env files.

4. Run the Development Server

npm run dev

The server will start at http://localhost:3000 by default.
🧠 Firebase Setup

    Create a Firebase project at https://console.firebase.google.com

    Enable Authentication → Email/Password or other providers

    Generate a service account for server SDK usage

    Copy credentials into your .env file

📨 Email Integration

Email is used as the messaging transport layer. For sending emails:

    You can use Gmail SMTP (with App Passwords)

    Or configure any SMTP provider in .env

The backend uses libraries like Nodemailer to send/receive messages.
📱 Mobile App (React Native – Planned)

To begin React Native development:

cd mobile/
npx react-native init ChatterboxMobile
# Connect to backend via REST API

The backend is designed with a mobile-first API structure, making it easy to integrate later.
📁 Project Structure (Example)

chatterbox/
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── index.js
├── config/
│   └── firebase.js
├── .env
├── .gitignore
├── package.json
├── README.md
└── mobile/ (planned)

⚡ Example API Endpoints
Method	Endpoint	Description
POST	/api/auth/login	Login with Firebase
POST	/api/message/send	Send a message via email
GET	/api/message/inbox	Fetch received messages
🛡️ Security Considerations

    Use App Passwords or OAuth2 for email

    Validate Firebase ID tokens on each request

    Never expose Firebase private keys on the frontend

🤝 Contributing

Contributions and feature suggestions are welcome!

git checkout -b feature/your-feature-name
git commit -m "Add new feature"
git push origin feature/your-feature-name

Open a PR on GitHub 🙌
📃 License

MIT License © Ahmed Kamal, Muhammad Qamar
📬 Contact

Developed by Ahmed Kamal, Muhammad Qamar
📧 ahmiii97@gmail.com
📧 hafizqamar07@gmail.com

🌐 your-website.com
(optional)
