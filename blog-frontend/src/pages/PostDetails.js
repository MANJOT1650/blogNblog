import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Trash2, Clock, Hash } from 'lucide-react';
import { getPosts, getComments, addComment, deletePost, togglePostLike, toggleCommentLike } from '../services/api';
import './PostDetails.css';

const PostDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchPostAndComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const postsResponse = await getPosts(user?.token);
      const foundPost = (postsResponse.data || []).find((p) => p.id === parseInt(id));
      if (!foundPost) {
        setError('Post not found.');
        setLoading(false);
        return;
      }
      setPost(foundPost);

      const commentsResponse = await getComments(id, user?.token);
      setComments(commentsResponse.data || []);
    } catch (err) {
      setError('Failed to load post details.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment({ postId: id, text: commentText }, user?.token);
      setCommentText('');
      setMessage('Comment added successfully.');
      const commentsResponse = await getComments(id, user?.token);
      setComments(commentsResponse.data || []);
    } catch (err) {
      setError('Failed to add comment.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id, user?.token);
      navigate('/');
    } catch (err) {
      setError('Unable to delete this post.');
    }
  };

  const handleToggleLike = async () => {
    try {
      await togglePostLike(id, user?.token);
      // Optimistic update
      setPost(prev => ({
          ...prev, 
          liked: !prev.liked, 
          likes: prev.liked ? prev.likes - 1 : prev.likes + 1
      }));
    } catch (err) {
      console.error('Like error:', err);
      // Rollback or refetch
      fetchPostAndComments();
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    try {
      await toggleCommentLike(commentId, user?.token);
      // Refresh comments
      const commentsResponse = await getComments(id, user?.token);
      setComments(commentsResponse.data || []);
    } catch (err) {
      console.error('Comment like error:', err);
    }
  };

  const canDelete = () => {
    return (
      post?.userId === user?.id ||
      post?.authorId === user?.id ||
      post?.author === user?.username
    );
  };

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="post-details-container">
      <div className="post-header">
        <div className="header-info">
          <div className="post-meta-top">
            <span className="post-category"><Hash size={14} /> {post.category || 'General'}</span>
            <span className="post-reading-time"><Clock size={14} /> {calculateReadingTime(post.content)} min read</span>
          </div>
          <h1>{post.title}</h1>
          <p className="post-meta">By <strong>{post.author || 'Unknown'}</strong></p>
        </div>
        <div className="post-actions-row">
          <button type="button" className={`like-button ${post.liked ? 'liked' : ''}`} onClick={(e) => { e.preventDefault(); handleToggleLike(); }}>
            <Heart size={20} fill={post.liked ? "currentColor" : "none"} /> <span>{post.likes || 0}</span>
          </button>
          {canDelete() && (
            <button className="danger-button" onClick={handleDelete}>
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="post-content">
        {post.imageUrl && <img src={`http://localhost:8080${post.imageUrl}`} alt={post.title} className="main-image" />}
        <p>{post.content}</p>
      </div>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>
        <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your thoughts..."
              required
            />
            <button type="submit" disabled={!commentText.trim()}>Post Comment</button>
        </form>

        {comments.length === 0 ? (
          <div className="empty-state">No comments yet. Be the first to share your thoughts!</div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-body">
                  <p className="comment-text">{comment.text || comment.body || ''}</p>
                  <div className="comment-footer">
                    <span className="comment-author">@{comment.username || 'anonymous'}</span>
                    <button
                      type="button"
                      className={`comment-like-btn ${comment.liked ? 'liked' : ''}`}
                      onClick={(e) => { e.preventDefault(); handleToggleCommentLike(comment.id); }}
                    >
                      <Heart size={14} fill={comment.liked ? "currentColor" : "none"} /> {comment.likes || 0}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PostDetails;