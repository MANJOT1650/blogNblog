import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { getPosts, togglePostLike } from '../services/api';
import axios from 'axios';
import './Home.css';

const Home = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [savedPosts, setSavedPosts] = useState(new Set());
  
  const fetchPosts = useCallback(async () => {
    try {
      const response = await getPosts(user?.token);
      setPosts(response.data || []);
    } catch (err) {
      console.error('Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/users/me/following', {
          headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(res.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch suggestions');
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchSuggestions();
  }, [fetchPosts, fetchSuggestions]);

  const handleToggleLike = async (post) => {
    const updatedPosts = posts.map(p => 
      p.id === post.id 
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } 
        : p
    );
    setPosts(updatedPosts);

    try {
      await togglePostLike(post.id, user?.token);
    } catch (err) {
      console.error('Unable to update like status.');
      setPosts(posts);
    }
  };

  const handleFollow = async (username) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/users/${username}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSuggestions();
    } catch (err) {
      console.error('Follow failed');
    }
  };

  if (loading) return <div className="loading">Checking for updates...</div>;

  return (
    <div className="home-container">
      <div className="home-feed">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.id} className="post-card">
              <header className="post-header">
                <Link to={`/${post.author}`} className="post-author-info">
                  <div className="author-avatar">
                    {post.userProfilePic ? (
                      <img src={`http://localhost:8080${post.userProfilePic}`} alt={post.author} />
                    ) : (
                      post.author[0].toUpperCase()
                    )}
                  </div>
                  <span className="author-username">{post.author}</span>
                </Link>
                <button className="more-options">
                  <MoreHorizontal size={20} />
                </button>
              </header>

              <div className="post-image">
                {post.imageUrl ? (
                  <img src={`http://localhost:8080${post.imageUrl}`} alt={post.title} />
                ) : (
                  <div className="no-image-placeholder">
                    <h3>{post.title}</h3>
                  </div>
                )}
              </div>

              <div className="post-actions">
                <div className="action-buttons">
                  <button 
                    type="button" 
                    className={`action-btn ${post.liked ? 'liked' : ''}`}
                    onClick={(e) => { e.preventDefault(); handleToggleLike(post); }}
                  >
                    <Heart size={24} fill={post.liked ? "currentColor" : "none"} />
                  </button>
                  <Link to={`/post/${post.id}`} className="action-btn">
                    <MessageCircle size={24} />
                  </Link>
                  <button className="action-btn">
                    <Send size={24} />
                  </button>
                </div>
                <button 
                  type="button"
                  className={`action-btn bookmark ${savedPosts.has(post.id) ? 'active' : ''}`}
                  onClick={() => {
                    const newSaved = new Set(savedPosts);
                    if (newSaved.has(post.id)) newSaved.delete(post.id);
                    else newSaved.add(post.id);
                    setSavedPosts(newSaved);
                  }}
                >
                  <Bookmark size={24} fill={savedPosts.has(post.id) ? "currentColor" : "none"} />
                </button>
              </div>

              <section className="post-details">
                <div className="likes-count"><strong>{post.likes}</strong> {post.likes === 1 ? 'like' : 'likes'}</div>
                <div className="post-caption">
                  <strong>{post.author}</strong> {post.title} - {post.content}
                </div>
                <Link to={`/post/${post.id}`} className="view-comments">
                  View all comments
                </Link>
                <div className="post-time">{new Date(post.createdAt).toLocaleDateString()}</div>
              </section>
            </article>
          ))
        ) : (
          <div className="no-posts">
            <h2>No posts yet</h2>
            <p>Start following people to see their posts here!</p>
          </div>
        )}
      </div>
      
      <aside className="suggestions-sidebar">
        <div className="current-user">
           <div className="avatar"> {user?.username[0].toUpperCase()} </div>
           <div className="info">
             <strong>{user?.username}</strong>
             <span>Welcome back!</span>
           </div>
        </div>
        <div className="suggestions-header">
           <span>Suggestions For You</span>
           <button className="see-all">See All</button>
        </div>
        <div className="suggestions-list">
          {suggestions.map(sug => (
            <div className="suggestion-item" key={sug.id}>
               <Link to={`/${sug.username}`} className="suggestion-user">
                 <div className="suggestion-avatar">
                   {sug.profilePicture ? (
                     <img src={`http://localhost:8080${sug.profilePicture}`} alt={sug.username} />
                   ) : (
                     sug.username[0].toUpperCase()
                   )}
                 </div>
                 <div className="suggestion-info">
                   <span className="username">{sug.username}</span>
                   <span className="meta">Suggested for you</span>
                 </div>
               </Link>
               <button className="follow-link" onClick={() => handleFollow(sug.username)}>Follow</button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Home;