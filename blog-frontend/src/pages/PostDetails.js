import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    console.log('Toggling like for post:', id, 'User token:', user?.token);
    try {
      const response = await togglePostLike(id, user?.token);
      console.log('Like response:', response);
      fetchPostAndComments();
    } catch (err) {
      console.error('Like error:', err);
      setError('Unable to toggle like.');
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    console.log('Toggling like for comment:', commentId, 'User token:', user?.token);
    try {
      const response = await toggleCommentLike(commentId, user?.token);
      console.log('Comment like response:', response);
      const commentsResponse = await getComments(id, user?.token);
      setComments(commentsResponse.data || []);
    } catch (err) {
      console.error('Comment like error:', err);
      setError('Unable to toggle comment like.');
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
    <div className="post-details">
      <div className="post-header">
        <div>
          <div className="post-meta-top">
            <span className="post-category">{post.category || 'General'}</span>
            <span className="post-reading-time">{calculateReadingTime(post.content)} min read</span>
          </div>
          <h1>{post.title}</h1>
          <p className="post-meta">By {post.author || post.username || 'Unknown'}</p>
        </div>
        <div className="post-actions-row">
          <button className={`like-button ${post.liked ? 'liked' : ''}`} onClick={handleToggleLike}>
            {post.liked ? '♥' : '♡'} {post.likes || 0}
          </button>
          {canDelete() && (
            <button className="danger-button" onClick={handleDelete}>
              Delete Post
            </button>
          )}
        </div>
      </div>

      <p className="post-content">{post.content}</p>

      {message && <div className="success-message">{message}</div>}

      <section className="comments-section">
        <h2>Comments</h2>
        {comments.length === 0 ? (
          <div className="empty-state">No comments yet.</div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <p>{comment.text || comment.body || ''}</p>
                <div className="comment-footer">
                  <p className="comment-author">{comment.username || comment.author || 'Anonymous'}</p>
                  <button
                    className={`comment-like-button ${comment.liked ? 'liked' : ''}`}
                    onClick={() => handleToggleCommentLike(comment.id)}
                  >
                    {comment.liked ? '♥' : '♡'} {comment.likes || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <form onSubmit={handleAddComment} className="comment-form">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment"
          required
        />
        <button type="submit">Add Comment</button>
      </form>
    </div>
  );
};

export default PostDetails;