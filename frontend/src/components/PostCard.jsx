import React, { useState } from 'react';
import { MoreVertical, MessageCircle, Heart, Share2, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const PostCard = ({ post, currentUser, onLike, onComment, onShare }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isLiked = post.likedByMe || post.likes?.includes(currentUser?._id);
  const isOwnPost = post.user._id === currentUser?._id;

  const handleLike = (e) => {
    e.stopPropagation();
    onLike?.(post._id);
  };

  return (
    <article className="post-card hover:shadow-social hover:-translate-y-1 transition-all rounded-3xl overflow-hidden group">
      {/* Post Header */}
      <div className="p-6 pb-4 flex items-start gap-4">
        <Link to={`/profile/${post.user.username}`} className="flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden shadow-md">
            {post.user.profileImage ? (
              <img src={post.user.profileImage} alt={post.user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">
                {post.user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link 
              to={`/profile/${post.user.username}`} 
              className="font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-1"
            >
              {post.user.full_name}
            </Link>
            <span className="text-sm text-gray-500">@{post.user.username}</span>
            <span className="text-xs text-gray-400">· {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          
          {isOwnPost && (
            <div className="relative">
              <MoreVertical 
                className="w-5 h-5 text-gray-500 hover:text-gray-900 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-all"
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              />
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white dark:bg-card border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 w-48 z-50">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                    Edit Post
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all">
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      {post.caption && (
        <div className="px-6 pb-6">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-3">{post.caption}</p>
        </div>
      )}

      {/* Post Media */}
      {post.image && (
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <img 
            src={post.image} 
            alt="Post media" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl font-medium transition-all ${
              isLiked 
                ? 'text-red-500 bg-red-50 hover:bg-red-100 shadow-sm' 
                : 'text-gray-600 hover:text-primary hover:bg-primary/10'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 stroke-red-500' : ''}`} />
            <span>{post.likesCount || 0}</span>
          </button>
          
          <button 
            onClick={onComment}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-2xl font-medium transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.commentsCount || 0}</span>
          </button>
          
          <button 
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-highlight hover:bg-highlight/10 rounded-2xl font-medium transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{post.views || 0} views</span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
