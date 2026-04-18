import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout, theme, toggleTheme }) => {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/">MyBlogs</Link>
      </div>
      <nav className="navbar-links">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        {user ? (
          <> 
            <Link to="/">Home</Link>
            <Link to="/create">Create Post</Link>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
