# 🛡️ SportShield AI — Anti-Piracy Intelligence Platform

> AI-powered anti-piracy system for live sports media. Protects broadcasters from illegal redistribution of live streams and clips.

![SportShield AI](https://img.shields.io/badge/SportShield-AI-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-green?style=flat-square&logo=flask)
![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?style=flat-square&logo=supabase)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Active-3448C5?style=flat-square&logo=cloudinary)

---

## 🚀 Features

- **🔐 Video Fingerprinting** — Generate unique digital signatures for official content using DCT-based perceptual hashing.
- **🔍 Piracy Detection** — Compare suspicious uploads against official content library with weighted multi-modal analysis.
- **✂️ Edit-Proof Detection** — Detects copies even when cropped, resized, watermarked removed, color graded, or re-encoded.
- **🔊 Audio Analysis** — Correlates audio energy signatures to detect piracy even when video is heavily modified.
- **📊 Real-Time Analytics** — Dashboard for monitoring detection trends, piracy sources, and high-risk alerts.
- **📋 Management & Reports** — Searchable history, risk filtering, and automated report generation.
- **🔑 Secure Authentication** — Role-based access powered by Supabase Auth.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite |
| **Backend** | Python Flask (hosted on Render) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Cloudinary (Media Assets) |
| **Detection Engine** | OpenCV + NumPy (Perceptual Hashing) |
| **UI Components** | Framer Motion, Recharts, React Icons |

---

## 📁 Project Structure

```
sportshield-ai/
├── src/
│   ├── components/          # Reusable UI components (Sidebar, Navbar, etc.)
│   ├── context/             # Auth and Global state
│   ├── pages/               # Functional pages (Dashboard, Upload, Scan, etc.)
│   ├── services/            # API and Database services
│   ├── utils/               # Helpers and Clients (Supabase, Firebase)
│   └── styles/              # Global CSS Design System
├── backend/
│   ├── app.py               # Flask Detection API
│   ├── requirements.txt     # Python Dependencies
│   └── uploads/             # Temporary processing folder (Gitignored)
├── public/                  # Static assets
└── index.html               # Frontend entry point
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- **Node.js 18+**
- **Python 3.10+**
- **Cloudinary Account** (for media storage)
- **Supabase Account** (for database and auth)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` in `backend/`:
```env
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
Run the server:
```bash
python app.py
```

### 3. Frontend Setup
```bash
npm install
```
Create a `.env` in the root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000/api # Points to local or deployed backend
```
Run the development server:
```bash
npm run dev
```

---

## 🔍 Demo Usage

1. **Login**: Use your Supabase credentials or the demo mode.
2. **Register Official Content**: Go to **Upload**, drag in an official video clip. This generates a permanent fingerprint.
3. **Scan Suspicious Link/File**: Go to **Scan**, upload a suspicious clip or provide a link.
4. **View Results**: The engine compares the multi-frame pHash and audio signatures to provide a % match and risk score.
5. **Monitor Dashboard**: Track active alerts and piracy trends in real-time.

---

## 🤖 Detection Engine Logic

The core detection uses a **Weighted Multi-Modal Engine**:
1. **Video (70%)**: DCT-based Perceptual Hashing (pHash) on multiple keyframes. Robust to cropping and color changes.
2. **Audio (20%)**: Inter-frame motion energy correlation (proxy for audio activity).
3. **Metadata (10%)**: Duration, resolution, and FPS ratio analysis.

---

---

## 👥 Team
Built for Hackathon Demo — SportShield AI Team

---

## 📄 License
MIT License — Use freely for educational / hackathon purposes.
