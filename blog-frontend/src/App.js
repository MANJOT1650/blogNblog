import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import './App.css';

const storedUser = () => {
  const saved = localStorage.getItem('blogUser');
  return saved ? JSON.parse(saved) : null;
};

const RequireAuth = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(storedUser());
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('blogUser');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return (
    <Router>
      <div className="app-layout">
        {user ? (
          <Sidebar user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
        ) : (
          <nav className="top-navbar">
            <div className="nav-logo">
              <Link to="/">blogNblog</Link>
            </div>
            <div className="nav-links">
              <button className="theme-toggle-btn" onClick={toggleTheme}>
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </div>
          </nav>
        )}
        <main className={`main-content ${!user ? 'no-sidebar' : ''}`}>
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <Register setUser={setUser} />}
            />
            <Route
              path="/"
              element={
                <RequireAuth user={user}>
                  <Home user={user} />
                </RequireAuth>
              }
            />
            <Route
              path="/direct/inbox"
              element={
                <RequireAuth user={user}>
                  <Chat user={user} />
                </RequireAuth>
              }
            />
            <Route
              path="/create"
              element={
                <RequireAuth user={user}>
                  <CreatePost user={user} />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth user={user}>
                  <Settings user={user} setUser={setUser} />
                </RequireAuth>
              }
            />
            <Route
              path="/post/:id"
              element={
                <RequireAuth user={user}>
                  <PostDetails user={user} />
                </RequireAuth>
              }
            />
            <Route
              path="/:username"
              element={
                <RequireAuth user={user}>
                  <Profile user={user} />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;