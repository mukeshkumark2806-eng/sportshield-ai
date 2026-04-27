// ═══════════════════════════════════════════════════
// Sidebar Component — SportShield AI
// ═══════════════════════════════════════════════════

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineUpload,
  HiOutlineShieldCheck,
  HiOutlineBell,
  HiOutlineDocumentReport,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineSearch,
} from 'react-icons/hi';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { path: '/upload', icon: HiOutlineUpload, label: 'Upload Content' },
  { path: '/scan', icon: HiOutlineSearch, label: 'Scan & Detect' },
  { path: '/results', icon: HiOutlineShieldCheck, label: 'Results' },
  { path: '/alerts', icon: HiOutlineBell, label: 'Live Alerts' },
  { path: '/reports', icon: HiOutlineDocumentReport, label: 'Reports' },
  { path: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar" id="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#g1)" />
            <path d="M16 6L22 10V22L16 26L10 22V10L16 6Z" fill="white" fillOpacity="0.9" />
            <path d="M16 12L19 14V20L16 22L13 20V14L16 12Z" fill="url(#g1)" />
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">SportShield</span>
          <span className="brand-tag">AI</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <item.icon className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.displayName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.displayName || 'Admin'}</span>
            <span className="user-role">Broadcaster</span>
          </div>
        </div>
        <button
          className="logout-btn"
          onClick={handleLogout}
          id="btn-logout"
          title="Logout"
        >
          <HiOutlineLogout />
        </button>
      </div>
    </aside>
  );
}
