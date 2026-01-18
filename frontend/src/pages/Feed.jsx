import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { assets, dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessages from '../components/RecentMessages';

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch posts (API first, fallback to dummy)
  const fetchFeeds = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      setRefreshing(isRefresh);
      
      // Try real API first
      const response = await api.get(`/posts/feed?page=${pageNum}&limit=10`);
      const newPosts = response.data?.posts || response.data?.data?.posts || [];
      
      if (pageNum === 1 || isRefresh) {
        setFeeds(newPosts);
      } else {
        setFeeds(prev => [...prev, ...newPosts]);
      }
      
    } catch (error) {
      console.log('API failed, using dummy data:', error.message);
      // Fallback to dummy data
      const newPosts = isRefresh || pageNum === 1 
        ? dummyPostsData.slice(0, 10 * pageNum)
        : [...feeds, ...dummyPostsData.slice(feeds.length, feeds.length + 10)];
      setFeeds(newPosts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [feeds]);

  // Initial load
  useEffect(() => {
    fetchFeeds(1);
  }, []);

  // Pull to refresh
  const handleRefresh = () => {
    fetchFeeds(1, true);
  };

  // Load more on scroll
  const loadMore = useCallback(() => {
    if (!loading && feeds.length > 0) {
      setPage(prev => prev + 1);
      fetchFeeds(page + 1);
    }
  }, [loading, feeds.length, page, fetchFeeds]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Pull to refresh indicator */}
        {refreshing && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mr-2" />
            <span className="text-slate-600 font-medium">Refreshing...</span>
          </div>
        )}

        {!loading ? (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left: Stories + Posts (Full width mobile) */}
            <div className="flex-1 lg:min-w-[500px] max-w-2xl">
              
              {/* Stories */}
              <StoriesBar />
              
              {/* Posts */}
              <div className="space-y-6 mt-6">
                {feeds.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-slate-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <span className="text-3xl">📱</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No posts yet</h3>
                    <p className="text-slate-600">Follow some people to see posts</p>
                  </div>
                ) : (
                  feeds.map((post) => (
                    <PostCard key={post._id || post.id} post={post} />
                  ))
                )}
                
                {/* Load more */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-2" />
                    <span className="text-slate-600">Loading more posts...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar (Desktop only) */}
            <div className="hidden lg:block lg:w-80 xl:w-96 sticky top-6 self-start">
              {/* Sponsored */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Sponsored</h3>
                <div className="space-y-3">
                  <img 
                    src={assets.sponsored_img} 
                    alt="Sponsored" 
                    className="w-full h-32 object-cover rounded-xl shadow-md" 
                  />
                  <h4 className="font-semibold text-slate-900 text-base leading-tight">Email Marketing Pro</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Supercharge your marketing with a powerful, easy-to-use platform built for results.
                  </p>
                  <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-emerald-500/25">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Recent Messages */}
              <RecentMessages />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Loading your feed...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
