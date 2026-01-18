import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Loader2, MessageCircle, Heart, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ✅ MOCK AUTH (replace when AuthContext ready)
const useAuth = () => ({
  user: JSON.parse(localStorage.getItem('user') || '{}') || {
    _id: 'currentUser',
    full_name: 'You',
    username: 'currentuser'
  }
});

// Mock API (REPLACE later)
const apiCall = async (url) => {
  if (url.includes('/posts')) {
    return new Promise(resolve => setTimeout(() => {
      resolve({
        data: { data: { 
          posts: [
            {
              _id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              caption: 'Welcome to LinkUp! 🚀 Feed working perfectly.',
              image: 'https://images.unsplash.com/photo-1618005182384-09b94bd3b4e8?w=500',
              likesCount: 42, commentsCount: 8, likedByMe: false, views: 1234,
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              user: { _id: '1', full_name: 'Sarah Johnson', username: 'sarahj' }
            },
            {
              _id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              caption: 'React + Tailwind = ❤️ #development',
              image: 'https://images.unsplash.com/photo-1464822759023-fed622b4e115?w=500',
              likesCount: 156, commentsCount: 23, likedByMe: true, views: 4567,
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              user: { _id: '2', full_name: 'Mike Chen', username: 'mikechen' }
            }
          ] 
        }}
      });
    }, 1000));
  }
  throw new Error('API mock');
};

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();
  const loadMoreRef = useRef();

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(pageNum === 1);
      const response = await apiCall(`/posts?page=${pageNum}`);
      const newPosts = response.data?.data?.posts || [];
      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
      setHasMore(newPosts.length > 0);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const updatePost = useCallback((postId, updates) => {
    setPosts(prev => prev.map(post => post._id === postId ? { ...post, ...updates } : post));
  }, []);

  const toggleLike = useCallback(async (postId) => {
    const post = posts.find(p => p._id === postId);
    if (!post) return;
    const wasLiked = post.likedByMe;
    try {
      await apiCall(`/posts/${postId}/like`);
      updatePost(postId, {
        likedByMe: !wasLiked,
        likesCount: wasLiked ? (post.likesCount || 0) - 1 : (post.likesCount || 0) + 1
      });
      toast.success(wasLiked ? 'Unliked' : 'Liked');
    } catch {
      toast.error('Like failed');
    }
  }, [posts, updatePost]);

  useEffect(() => {
    if (loadingMore || !hasMore || !loadMoreRef.current) return;
    const node = loadMoreRef.current;
    observer.current?.disconnect();
    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPage(p => p + 1);
        setLoadingMore(true);
      }
    }, { threshold: 0.1, rootMargin: '100px' });
    observer.current.observe(node);
    return () => observer.current?.disconnect();
  }, [loadingMore, hasMore]);

  useEffect(() => {
    if (page > 1) fetchPosts(page, true);
  }, [page, fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center post-card p-12 shadow-social">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
          <p className="text-xl font-semibold text-gray-700">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
      <div className="post-card p-6 rounded-3xl shadow-social sticky top-4 z-10">
        <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-primary bg-clip-text text-transparent mb-2">
          Home Feed
        </h1>
        <p className="text-sm text-gray-600">{posts.length} posts</p>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post._id} className="post-card hover:shadow-social hover:-translate-y-1 transition-all rounded-3xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-md overflow-hidden">
                {post.user?.profileImage ? (
                  <img src={post.user.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">{post.user?.full_name?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 hover:text-primary cursor-pointer">
                    {post.user?.full_name || 'User'}
                  </h3>
                  <span className="text-sm text-gray-500">@{post.user?.username || 'user'}</span>
                  <span className="text-xs text-gray-400">· {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {post.caption && <p className="text-gray-800 mb-4">{post.caption}</p>}
            
            {post.image && (
              <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-6">
                <img src={post.image} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            )}

            <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
              <button 
                onClick={() => toggleLike(post._id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition-all ${
                  post.likedByMe 
                    ? 'text-red-500 bg-red-50 shadow-sm' 
                    : 'text-gray-600 hover:text-primary hover:bg-primary/10'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.likedByMe ? 'fill-red-500' : ''}`} />
                <span>{post.likesCount || 0}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary rounded-2xl">
                <MessageCircle className="w-5 h-5" />
                <span>{post.commentsCount || 0}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary rounded-2xl">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div ref={loadMoreRef} className="h-20" />
      {loadingMore && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading more...</span>
        </div>
      )}
    </div>
  );
};

export default Home;
