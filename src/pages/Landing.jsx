// ═══════════════════════════════════════════════════
// Landing Page — SportShield AI
// ═══════════════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineShieldCheck,
  HiOutlineFingerPrint,
  HiOutlineBell,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineGlobe,
} from 'react-icons/hi';
import './Landing.css';

const features = [
  {
    icon: HiOutlineFingerPrint,
    title: 'Video Fingerprinting',
    desc: 'Advanced perceptual hashing generates unique digital signatures for every frame of your content.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Edit-Proof Detection',
    desc: 'Detects pirated copies even when cropped, resized, watermark-removed, or re-encoded.',
  },
  {
    icon: HiOutlineBell,
    title: 'Real-Time Alerts',
    desc: 'Instant notifications when unauthorized redistribution of your live streams is detected.',
  },
  {
    icon: HiOutlineLightningBolt,
    title: 'Lightning Fast Scan',
    desc: 'Scan and compare thousands of suspicious uploads against your content library in seconds.',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Analytics Dashboard',
    desc: 'Comprehensive reports showing piracy hotspots, trends, and threat risk scoring.',
  },
  {
    icon: HiOutlineGlobe,
    title: 'Multi-Platform Sweep',
    desc: 'Monitor YouTube, Telegram, social media, and illegal streaming sites simultaneously.',
  },
];

const stats = [
  { value: '98.7%', label: 'Detection Accuracy' },
  { value: '< 2s', label: 'Scan Speed' },
  { value: '500K+', label: 'Videos Monitored' },
  { value: '50+', label: 'Broadcasters' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing" id="landing-page">
      {/* ── Navbar ──────────────── */}
      <header className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#lg1)" />
              <path d="M16 6L22 10V22L16 26L10 22V10L16 6Z" fill="white" fillOpacity="0.9" />
              <path d="M16 12L19 14V20L16 22L13 20V14L16 12Z" fill="url(#lg1)" />
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span>SportShield <em>AI</em></span>
          </div>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#stats">Stats</a>
            <a href="#problem">Why Us</a>
          </nav>
          <div className="nav-actions">
            <button className="btn-secondary" onClick={() => navigate('/login')} id="btn-landing-login">
              Log In
            </button>
            <button className="btn-primary" onClick={() => navigate('/login')} id="btn-landing-signup">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────── */}
      <section className="hero">
        <div className="hero-bg-effects">
          <div className="glow-orb orb-1" />
          <div className="glow-orb orb-2" />
          <div className="grid-overlay" />
        </div>
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="hero-badge">
            <HiOutlineShieldCheck />
            AI-Powered Anti-Piracy Platform
          </div>
          <h1 className="hero-title">
            Protect Your <span className="gradient-text">Live Sports</span>
            <br />From Illegal Piracy
          </h1>
          <p className="hero-subtitle">
            SportShield AI uses advanced video fingerprinting and neural detection to identify
            unauthorized redistribution of your live broadcasts — even heavily edited copies.
          </p>
          <div className="hero-cta">
            <button className="btn-primary btn-lg" onClick={() => navigate('/login')} id="btn-hero-start">
              <HiOutlineShieldCheck /> Start Protecting Now
            </button>
            <button className="btn-secondary btn-lg" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} id="btn-hero-learn">
              Learn More
            </button>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="shield-visual">
            <div className="shield-ring ring-1" />
            <div className="shield-ring ring-2" />
            <div className="shield-ring ring-3" />
            <div className="shield-core">
              <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L24 8V18C24 23 20 27 16 28C12 27 8 23 8 18V8L16 4Z" fill="url(#shd1)" stroke="rgba(59,130,246,0.5)" strokeWidth="0.5" />
                <path d="M14 16L16 18L20 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="shd1" x1="8" y1="4" x2="24" y2="28">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="float-card fc-1">
              <span className="fc-dot danger" />
              94.7% Match
            </div>
            <div className="float-card fc-2">
              <span className="fc-dot warning" />
              Cropped Copy
            </div>
            <div className="float-card fc-3">
              <span className="fc-dot success" />
              Scan Complete
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Problem Section ─────── */}
      <section className="problem-section" id="problem">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-heading">
              Sports Piracy Costs <span className="gradient-text">$28.3 Billion</span> Annually
            </h2>
            <p className="section-desc">
              Illegal streaming and unauthorized redistribution of live sports content threatens
              broadcasters worldwide. Traditional methods cannot detect edited, cropped, or
              re-encoded copies. SportShield AI changes that.
            </p>
          </motion.div>
          <div className="problem-cards">
            <motion.div className="prob-card" whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="prob-icon danger-bg">🏴‍☠️</div>
              <h3>Live Stream Hijacking</h3>
              <p>Pirates re-stream live broadcasts in real-time to illegal platforms, siphoning millions of viewers.</p>
            </motion.div>
            <motion.div className="prob-card" whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="prob-icon warning-bg">✂️</div>
              <h3>Clip & Edit Tactics</h3>
              <p>Content is cropped, watermarked removed, resolution changed, and re-uploaded to evade detection.</p>
            </motion.div>
            <motion.div className="prob-card" whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <div className="prob-icon accent-bg">💸</div>
              <h3>Revenue Loss</h3>
              <p>Broadcasters lose subscription and advertising revenue as viewers move to free pirated streams.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────── */}
      <section className="features-section" id="features">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-heading">Powerful Detection Features</h2>
            <p className="section-desc">
              Advanced AI-powered tools to protect your sports content across the internet.
            </p>
          </motion.div>
          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="feature-icon">
                  <f.icon />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────── */}
      <section className="stats-section" id="stats">
        <div className="section-container">
          <div className="stats-banner">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                className="stat-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────── */}
      <section className="cta-section">
        <div className="section-container">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Protect Your Broadcasts?</h2>
            <p>Join leading sports broadcasters using SportShield AI to fight piracy.</p>
            <button className="btn-primary btn-lg" onClick={() => navigate('/login')} id="btn-cta-signup">
              Get Started Free →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────── */}
      <footer className="landing-footer">
        <div className="nav-container">
          <span>© 2026 SportShield AI — Built for Hackathon Demo</span>
          <span>Contact: Mukeshkumar.k2806@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}
