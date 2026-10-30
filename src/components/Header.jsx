import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { getStoredUser } from '../services/authApi';
import './Header.css';

function Header({ _name, theme, toggleTheme }) {
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const checkAuth = () => setUser(getStoredUser());
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth:expired', checkAuth);
    const interval = setInterval(checkAuth, 1500);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth:expired', checkAuth);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="navbar-header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">Portfolio</span>
        </Link>
        <nav className="header-nav" id="main-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Home
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Projects
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Tasks (JWT Secured)
            {user && (
              <span 
                style={{
                  display: 'inline-block',
                  width: '7px',
                  height: '7px',
                  background: '#10b981',
                  borderRadius: '50%',
                  marginLeft: '6px',
                  boxShadow: '0 0 6px #10b981'
                }} 
                title={`Active JWT Session: ${user.name}`}
              />
            )}
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Contact
          </NavLink>
          <button 
            className="theme-toggle" 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
