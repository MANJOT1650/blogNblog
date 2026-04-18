import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, deletePost, togglePostLike } from '../services/api';
import './Home.css';

const Home = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMyPosts, setShowOnlyMyPosts] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPosts(user?.token);
      setPosts(response.data || []);
    } catch (err) {
      setError('Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id, user?.token);
      setPosts(posts.filter((post) => post.id !== id));
      setMessage('Post deleted successfully.');
    } catch (err) {
      setError('Failed to delete post.');
    }
  };

  const handleToggleLike = async (post) => {
    try {
      await togglePostLike(post.id, user?.token);
      fetchPosts();
    } catch (err) {
      setError('Unable to update like status.');
    }
  };

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = showOnlyMyPosts ? (post.userId === user?.id || post.author === user?.username) : true;
    
    return matchesSearch && matchesUser;
  });

  const canDelete = (post) => {
    return (
      post.userId === user?.id ||
      post.authorId === user?.id ||
      post.author === user?.username
    );
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home">
      <div className="home-header">
        <h1>Latest Posts</h1>
        <Link to="/create" className="create-link">
          Create New Post
        </Link>
      </div>

      <div className="home-controls">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search posts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <label>
            <input 
              type="checkbox" 
              checked={showOnlyMyPosts}
              onChange={(e) => setShowOnlyMyPosts(e.target.checked)}
            />
            My Posts Only
          </label>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}

      <div className="posts-list">
        {filteredPosts.length === 0 ? (
          <div className="empty-state">No posts found.</div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="post-item">
              <div className="post-top">
                <div>
                  <div className="post-meta-top">
                    <span className="post-category">{post.category || 'General'}</span>
                    <span className="post-reading-time">{calculateReadingTime(post.content)} min read</span>
                  </div>
                  <h2>{post.title}</h2>
                  <p className="post-author">By {post.author || post.username || 'Unknown'}</p>
                </div>
                <button
                  className={`like-button ${post.liked ? 'liked' : ''}`}
                  onClick={() => handleToggleLike(post)}
                >
                  {post.liked ? '♥' : '♡'} {post.likes || 0}
                </button>
              </div>
              <p>{(post.content || '').substring(0, 140)}...</p>
              <div className="post-actions">
                <Link to={`/post/${post.id}`}>View Details</Link>
                {canDelete(post) && (
                  <button onClick={() => handleDelete(post.id)} className="delete-btn">Delete</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;