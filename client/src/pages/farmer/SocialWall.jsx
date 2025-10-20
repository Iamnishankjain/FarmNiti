import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { socialAPI } from '../../services/api';
import { timeAgo } from '../../utils/helpers';
import Loader from '../../components/common/Loader';

const SocialWall = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await socialAPI.getPosts();
      setPosts(response.data.posts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setPosting(true);
      const response = await socialAPI.createPost({ content: newPost });
      setPosts([response.data.post, ...posts]);
      setNewPost('');
      setPosting(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
      setPosting(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await socialAPI.likePost(postId);
      
      // Update posts locally
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const userLiked = post.likes.includes(user.id);
          return {
            ...post,
            likes: userLiked 
              ? post.likes.filter(id => id !== user.id)
              : [...post.likes, user.id]
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;

    try {
      const response = await socialAPI.addComment(postId, comment);
      
      // Update posts with new comment
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: response.data.comments
          };
        }
        return post;
      }));

      // Clear comment input
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('social.title')}</h1>
        <p className="mt-2 text-gray-600">Share your farming journey with the community</p>
      </div>

      {/* Create Post */}
      <div className="card mb-6">
        <form onSubmit={handleCreatePost}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={t('social.shareThought')}
                className="input h-24 resize-none"
                disabled={posting}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={posting || !newPost.trim()}
                  className="btn btn-primary"
                >
                  {posting ? 'Posting...' : t('social.post')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="social-post">
              {/* Post Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                    {post.user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                  <p className="text-sm text-gray-500">
                    {post.user.village && post.user.district && 
                      `${post.user.village}, ${post.user.district}`
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeAgo(post.createdAt)}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt="Post image"
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center space-x-6 py-3 border-t border-gray-200">
                <button
                  onClick={() => handleLikePost(post._id)}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                    post.likes.includes(user.id)
                      ? 'text-red-600'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <span>{post.likes.includes(user.id) ? '❤️' : '🤍'}</span>
                  <span>{post.likes.length} {t('social.like')}</span>
                </button>

                <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                  <span>💬</span>
                  <span>{post.comments.length} {t('social.comment')}</span>
                </button>
              </div>

              {/* Comments Section */}
              {post.comments.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                  {post.comments.map((comment) => (
                    <div key={comment._id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-sm font-bold">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-sm text-gray-900">
                          {comment.user.name}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {timeAgo(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="mt-4 flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    value={commentInputs[post._id] || ''}
                    onChange={(e) => setCommentInputs({
                      ...commentInputs,
                      [post._id]: e.target.value
                    })}
                    placeholder={t('social.writeComment')}
                    className="input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddComment(post._id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAddComment(post._id)}
                    className="btn btn-primary"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialWall;
