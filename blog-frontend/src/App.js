import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('blogUser', JSON.stringify(user));
      localStorage.setItem('token', user.token || user.accessToken);
      localStorage.setItem('username', user.username);
    } else {
      localStorage.removeItem('blogUser');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
        <main className="main-content">
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