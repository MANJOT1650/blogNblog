import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Home, Search, MessageCircle, PlusSquare, UserCircle, Settings, LogOut, Sun, Moon, X } from 'lucide-react';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = ({ user, onLogout, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSearchResults();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSearchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/api/users/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  if (!user) return null;

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-container">
          <div className="sidebar-logo">
            <NavLink to="/">blogNblog</NavLink>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setShowSearch(false)}>
              <Home size={28} />
              <span>Home</span>
            </NavLink>

            <div 
              className={`nav-item ${showSearch ? 'active' : ''}`} 
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search size={28} />
              <span>Search</span>
            </div>

            <NavLink to="/direct/inbox" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setShowSearch(false)}>
              <MessageCircle size={28} />
              <span>Messages</span>
            </NavLink>

            <NavLink to="/create" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setShowSearch(false)}>
              <PlusSquare size={28} />
              <span>Create</span>
            </NavLink>

            <NavLink to={`/${user.username}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setShowSearch(false)}>
              <UserCircle size={28} />
              <span>Profile</span>
            </NavLink>

            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setShowSearch(false)}>
              <Settings size={28} />
              <span>Settings</span>
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={28} /> : <Sun size={28} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            
            <button className="nav-item logout-btn" onClick={handleLogoutClick}>
              <LogOut size={28} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for Search */}
      {showSearch && <div className="search-backdrop" onClick={() => setShowSearch(false)} />}

      {/* Search Overlay/Panel */}
      <div className={`search-panel ${showSearch ? 'open' : ''}`} ref={searchRef}>
        <div className="search-header">
          <h2>Search</h2>
          <button className="close-search" onClick={() => setShowSearch(false)}><X size={20} /></button>
        </div>
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={showSearch}
          />
        </div>
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map(result => (
              <Link 
                to={`/${result.username}`} 
                key={result.id} 
                className="search-result-item"
                onClick={() => setShowSearch(false)}
              >
                <div className="result-avatar">
                  {result.profilePicture ? (
                    <img src={`http://localhost:8080${result.profilePicture}`} alt="" />
                  ) : (
                    result.username[0].toUpperCase()
                  )}
                </div>
                <div className="result-info">
                  <span className="result-username">{result.username}</span>
                  <span className="result-bio">{result.bio || 'No bio yet'}</span>
                </div>
              </Link>
            ))
          ) : (
            searchQuery && <div className="no-results">No users found for "{searchQuery}"</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
