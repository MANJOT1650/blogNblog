import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Grid, Bookmark, Heart, MessageSquare, UserX } from 'lucide-react';
import axios from 'axios';
import './Profile.css';

const Profile = ({ user: currentUser }) => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [totalPostsCount, setTotalPostsCount] = useState(0);
    const [activeTab, setActiveTab] = useState('POSTS'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const [profileRes, postsRes] = await Promise.all([
                axios.get(`http://localhost:8080/api/users/${username}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:8080/api/posts?username=${username}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setProfile(profileRes.data);
            const userPosts = postsRes.data || [];
            setTotalPostsCount(userPosts.length);
            setPosts(userPosts);
            setIsFollowing(profileRes.data.isFollowing);
        } catch (err) {
            console.error('Profile fetch failed', err);
            setError(err.response?.status === 404 ? 'User not found.' : 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    }, [username]);

    const fetchTabData = useCallback(async () => {
        const token = localStorage.getItem('token');
        let url = '';
        if (activeTab === 'POSTS') url = `http://localhost:8080/api/posts?username=${username}`;
        else if (activeTab === 'SAVED') url = `http://localhost:8080/api/users/${username}/saved`;
        else if (activeTab === 'LIKED') url = `http://localhost:8080/api/users/${username}/liked`;
        else if (activeTab === 'COMMENTED') url = `http://localhost:8080/api/users/${username}/commented`;

        try {
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(res.data || []);
        } catch (err) {
            console.error('Failed to fetch tab data');
            if (err.response?.status === 403) {
                setPosts([]); // Clear posts if access denied
            }
        }
    }, [activeTab, username]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    useEffect(() => {
        if (profile) fetchTabData();
    }, [activeTab, profile, fetchTabData]);

    const handleFollowToggle = async () => {
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            await axios.post(`http://localhost:8080/api/users/${username}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsFollowing(!isFollowing);
            setProfile(prev => ({
                ...prev,
                followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
            }));
        } catch (err) {
            console.error('Follow operation failed');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="loading">Loading profile...</div>;

    if (error) {
        return (
            <div className="profile-error-container">
                <UserX size={64} className="error-icon" />
                <h2>{error}</h2>
                <p>The link you followed may be broken, or the page may have been removed.</p>
                <Link to="/" className="back-home-link">Go back to Home</Link>
            </div>
        );
    }

    const isOwnProfile = currentUser.username === username;

    return (
        <div className="profile-container">
            <header className="profile-info-section">
                <div className="profile-pic-container">
                    {profile.profilePicture ? (
                        <img src={`http://localhost:8080${profile.profilePicture}`} alt={profile.username} />
                    ) : (
                        <div className="profile-pic-placeholder">{profile.username[0].toUpperCase()}</div>
                    )}
                </div>
                
                <div className="profile-details">
                    <div className="profile-username-row">
                        <h1>{profile.username}</h1>
                        {isOwnProfile ? (
                            <Link to="/settings" className="edit-profile-btn">Edit Profile</Link>
                        ) : (
                            <button 
                                type="button"
                                className={`follow-btn-main ${isFollowing ? 'unfollow' : 'follow'}`}
                                onClick={handleFollowToggle}
                                disabled={isProcessing}
                            >
                                {isProcessing ? '...' : (isFollowing ? 'Following' : 'Follow')}
                            </button>
                        )}
                    </div>

                    <div className="profile-stats">
                        <span><strong>{totalPostsCount}</strong> posts</span>
                        <span><strong>{profile.followersCount}</strong> followers</span>
                        <span><strong>{profile.followingCount}</strong> following</span>
                    </div>

                    <div className="profile-bio">
                        <p className="full-name">{profile.username}</p>
                        <p className="bio-text">{profile.bio || "No bio yet."}</p>
                    </div>
                </div>
            </header>

            <div className="profile-tabs">
                <button 
                    className={`tab-item ${activeTab === 'POSTS' ? 'active' : ''}`}
                    onClick={() => setActiveTab('POSTS')}
                >
                    <Grid size={12} /> POSTS
                </button>
                {isOwnProfile && (
                    <button 
                        className={`tab-item ${activeTab === 'SAVED' ? 'active' : ''}`}
                        onClick={() => setActiveTab('SAVED')}
                    >
                        <Bookmark size={12} /> SAVED
                    </button>
                )}
                <button 
                    className={`tab-item ${activeTab === 'LIKED' ? 'active' : ''}`}
                    onClick={() => setActiveTab('LIKED')}
                >
                    <Heart size={12} /> LIKED
                </button>
                <button 
                    className={`tab-item ${activeTab === 'COMMENTED' ? 'active' : ''}`}
                    onClick={() => setActiveTab('COMMENTED')}
                >
                    <MessageSquare size={12} /> COMMENTED
                </button>
            </div>

            <div className="profile-posts-grid">
                {posts.length === 0 ? (
                    <div className="no-posts">
                        <h3>No {activeTab.toLowerCase()} yet</h3>
                        <p>Share, like, or comment on posts to see them here.</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <Link to={`/post/${post.id}`} key={post.id} className="grid-post">
                            {post.imageUrl ? (
                                <img src={`http://localhost:8080${post.imageUrl}`} alt={post.title} />
                            ) : (
                                <div className="post-text-placeholder">{post.title}</div>
                            )}
                            <div className="post-overlay">
                                <span><Heart size={20} fill="white" /> {post.likes || 0}</span>
                                <span><MessageSquare size={20} fill="white" /> {post.commentsCount || 0}</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Profile;
