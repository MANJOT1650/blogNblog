import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout, theme, toggleTheme }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="insta-nav">
      <div className="nav-content">
        <Link to="/" className="logo">InstaBlog</Link>
        
        {user && (
          <div className="nav-search">
            <input type="text" placeholder="Search" />
          </div>
        )}

        <div className="nav-icons">
          <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {user ? (
            <>
              <Link to="/" title="Home" className="nav-icon">🏠</Link>
              <Link to="/direct/inbox" title="Messages" className="nav-icon">💬</Link>
              <Link to="/create" title="Create" className="nav-icon">➕</Link>
              <Link to={`/${user.username}`} title="Profile" className="nav-icon">👤</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="login-btn">Log In</Link>
              <Link to="/register" className="signup-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
