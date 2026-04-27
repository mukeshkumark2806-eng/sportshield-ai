# 🛡️ SportShield AI — Anti-Piracy Intelligence Platform

> AI-powered anti-piracy system for live sports media. Protects broadcasters from illegal redistribution of live streams and clips.

![SportShield AI](https://img.shields.io/badge/SportShield-AI-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-green?style=flat-square&logo=flask)
![OpenCV](https://img.shields.io/badge/OpenCV-Ready-red?style=flat-square&logo=opencv)

---

## 🚀 Features

- **🔐 Video Fingerprinting** — Generate unique digital signatures for official content
- **🔍 Piracy Detection** — Compare suspicious uploads against official content library
- **✂️ Edit-Proof Detection** — Detects copies even when cropped, resized, watermarked removed, or re-encoded
- **🔔 Real-Time Alerts** — Instant notifications with risk scoring
- **📊 Analytics Dashboard** — Detection trends, piracy sources, risk scores
- **📋 Reports & History** — Search, filter, and export detection history
- **⚙️ Admin Settings** — Configure detection thresholds and notifications
- **🔑 Authentication** — Firebase Auth ready (demo login included)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Dark Theme) |
| Routing | React Router v6 |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | React Icons (Heroicons) |
| Backend | Python Flask |
| AI / Detection | OpenCV (ready structure) |
| Auth | Firebase Auth (demo mode) |
| Database | Firebase Firestore (ready) |
| Storage | Firebase Storage (ready) |

---

## 📁 Project Structure

```
sportshield-ai/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   └── Sidebar.css
│   ├── context/             # React contexts
│   │   └── AuthContext.jsx  # Authentication state
│   ├── pages/               # Page components
│   │   ├── Landing.jsx      # Public landing page
│   │   ├── Login.jsx        # Auth page
│   │   ├── Dashboard.jsx    # Overview dashboard
│   │   ├── Upload.jsx       # Upload official content
│   │   ├── Scan.jsx         # Scan suspicious content
│   │   ├── Results.jsx      # Detection results
│   │   ├── Alerts.jsx       # Live alerts panel
│   │   ├── Reports.jsx      # Reports & history
│   │   └── Settings.jsx     # Admin settings
│   ├── styles/
│   │   └── index.css        # Global design system
│   ├── utils/
│   │   ├── firebase.js      # Firebase config
│   │   ├── mockData.js      # Demo data
│   │   └── detectionEngine.js # Detection algorithms
│   ├── App.jsx              # Main router
│   └── main.jsx             # Entry point
├── backend/
│   ├── app.py               # Flask API server
│   └── requirements.txt     # Python dependencies
├── index.html               # HTML entry
├── vite.config.js            # Vite config
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+ (for backend)

### Frontend

```bash
# Install dependencies
cd sportshield-ai
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Backend (Optional)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

Backend runs on [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Login

Use the **Quick Demo Login** button on the login page, or enter any email/password combination.

**Demo Credentials:**
- Email: `admin@sportshield.ai`
- Password: `demo123`

---

## 📸 Pages Overview

| Page | Description |
|------|------------|
| **Landing** | Hero section, problem statement, features, stats |
| **Login** | Firebase Auth ready, demo login available |
| **Dashboard** | Stats cards, detection trends chart, piracy sources, recent alerts |
| **Upload** | Drag & drop, fingerprint generation, content library |
| **Scan & Detect** | Side-by-side upload, progress bar, instant results |
| **Results** | Card grid with match %, risk levels, modifications |
| **Alerts** | Red alert cards, LIVE badge, filter & dismiss |
| **Reports** | Searchable table, risk filters, export ready |
| **Settings** | Threshold slider, notification toggles, content management |

---

## 🔧 Firebase Setup (Production)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore Database**
4. Enable **Storage**
5. Copy your config to `src/utils/firebase.js`

---

## 🤖 AI Detection Logic

The current demo uses simulated detection. For production:

1. **Perceptual Hashing (pHash)** — Uses DCT-based hashing via OpenCV
2. **Frame-by-Frame Comparison** — Extract keyframes and compare fingerprints
3. **Hamming Distance** — Calculate similarity between hash values
4. **Modification Detection** — Analyze aspect ratio, resolution, audio changes

See `backend/app.py` for commented OpenCV production code examples.

---

## 👥 Team

Built for Hackathon Demo — SportShield AI Team

---

## 📄 License

MIT License — Use freely for educational / hackathon purposes.
