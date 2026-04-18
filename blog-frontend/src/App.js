import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';
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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('blogUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('blogUser');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
        <main>
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
            <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;