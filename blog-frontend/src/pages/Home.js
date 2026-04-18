import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, togglePostLike } from '../services/api';
import './Home.css';

const Home = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleToggleLike = async (post) => {
    try {
      await togglePostLike(post.id, user?.token);
      setPosts(posts.map(p => 
        p.id === post.id 
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } 
          : p
      ));
    } catch (err) {
      console.error('Unable to update like status.');
    }
  };

  if (loading) return <div className="loading">Checking for updates...</div>;

  return (
    <div className="feed-container">
      <div className="posts-feed">
        {posts.map((post) => (
          <article key={post.id} className="feed-post">
            <header className="post-header">
              <Link to={`/${post.author}`} className="author-info">
                 <div className="author-avatar">
                   {post.userProfilePic ? (
                     <img src={`http://localhost:8080${post.userProfilePic}`} alt={post.author} />
                   ) : (
                     <div className="avatar-placeholder">{post.author[0].toUpperCase()}</div>
                   )}
                 </div>
                 <span className="author-username">{post.author}</span>
              </Link>
              <button className="more-options">•••</button>
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
                  className={`action-btn like ${post.liked ? 'active' : ''}`}
                  onClick={() => handleToggleLike(post)}
                >
                  {post.liked ? '❤️' : '♡'}
                </button>
                <Link to={`/post/${post.id}`} className="action-btn">💬</Link>
                <button className="action-btn">✈️</button>
              </div>
              <button className="action-btn bookmark">🔖</button>
            </div>

            <section className="post-details">
              <div className="likes-count"><strong>{post.likes}</strong> likes</div>
              <div className="post-caption">
                <strong>{post.author}</strong> {post.title} - {post.content}
              </div>
              <div className="view-comments">View all comments</div>
              <div className="post-time">{new Date(post.createdAt).toLocaleDateString()}</div>
            </section>
          </article>
        ))}
      </div>
      
      <div className="suggestions-sidebar">
        <div className="current-user">
           <div className="avatar"> {user?.username[0].toUpperCase()} </div>
           <div className="info">
             <strong>{user?.username}</strong>
             <span>Welcome back!</span>
           </div>
        </div>
        <div className="suggestions-header">
           <span>Suggestions For You</span>
           <strong>See All</strong>
        </div>
        <div className="suggestion-item">
           <div className="avatar">A</div>
           <div className="info">
             <strong>antigravity_ai</strong>
             <span>Suggested for you</span>
           </div>
           <button className="follow-btn">Follow</button>
        </div>
      </div>
    </div>
  );
};

export default Home;