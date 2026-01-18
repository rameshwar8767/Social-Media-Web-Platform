import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Image, Heart, MoreHorizontal, X } from "lucide-react";
import { toast } from "react-hot-toast";

// ✅ INLINE MOCK AUTH (no external imports needed)
const useAuth = () => ({
  user: JSON.parse(localStorage.getItem('user') || 'null') || {
    _id: 'me',
    full_name: 'You',
    username: 'currentuser'
  }
});

// Mock data
const dummyUserData = {
  _id: "user123",
  full_name: "Sarah Johnson",
  username: "sarahj",
  bio: "Building beautiful web experiences with React & Tailwind ✨",
  followers: 1247, following: 389, postsCount: 42,
  profile_picture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
  cover_photo: "https://images.unsplash.com/photo-1465378226-f8f5ce9645f2?w=1200"
};

const dummyPostsData = [
  {
    _id: "1", caption: "Loving the new Tailwind gradients! 🎨", 
    image: "https://images.unsplash.com/photo-1618005182384-09b94bd3b4e8?w=500",
    likesCount: 42, commentsCount: 8, likedByMe: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    user: dummyUserData
  },
  {
    _id: "2", caption: "Weekend coding session 💻", 
    image: "https://images.unsplash.com/photo-1464822759023-fed622b4e115?w=500",
    likesCount: 156, commentsCount: 23,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    user: dummyUserData
  }
];

const Profile = () => {
  const { profileId = "me" } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      // Mock delay → Replace with real API
      await new Promise(r => setTimeout(r, 1200));
      
      setProfileUser(dummyUserData);
      setPosts(dummyPostsData);
    } catch (error) {
      toast.error("Profile failed to load");
      setProfileUser(dummyUserData);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isOwnProfile = profileId === 'me' || currentUser._id === profileUser?._id;
  const mediaPosts = posts.filter(p => p.image);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="post-card p-12 shadow-social text-center max-w-md">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
          <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="post-card rounded-3xl shadow-social overflow-hidden mb-8">
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/30 via-accent/30 to-highlight/30 overflow-hidden">
            {profileUser.cover_photo && (
              <img src={profileUser.cover_photo} alt="" className="w-full h-full object-cover" />
            )}
            {isOwnProfile && (
              <button className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
                <Image className="w-6 h-6 text-primary" />
              </button>
            )}
          </div>

          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl border-8 border-white/70 overflow-hidden relative">
                  {profileUser.profile_picture ? (
                    <img src={profileUser.profile_picture} alt="" className="w-full h-full object-cover rounded-2.5xl" />
                  ) : (
                    <span className="text-3xl font-black text-white drop-shadow-lg">
                      {profileUser.full_name?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                {isOwnProfile && (
                  <button className="absolute -bottom-3 -right-3 bg-primary p-3 rounded-3xl shadow-2xl hover:shadow-primary/50 transition-all">
                    <MoreHorizontal className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-primary to-accent bg-clip-text text-transparent mb-2">
                  {profileUser.full_name}
                </h1>
                <Link to={`/${profileUser.username}`} className="block text-xl font-bold text-primary hover:text-accent mb-3">
                  @{profileUser.username}
                </Link>
                {profileUser.bio && (
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl leading-relaxed">
                    {profileUser.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-gray-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900 dark:text-white">{profileUser.postsCount || posts.length}</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide font-semibold mt-1">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900 dark:text-white">{profileUser.followers || 0}</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide font-semibold mt-1">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900 dark:text-white">{profileUser.following || 0}</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide font-semibold mt-1">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="post-card p-2 rounded-3xl shadow-sm bg-white/80 backdrop-blur-md flex">
          {[
            { id: "posts", label: "Posts", count: posts.length },
            { id: "media", label: "Media", count: mediaPosts.length },
            { id: "likes", label: "Likes", count: 23 }
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-xl hover:shadow-primary/50'
                  : 'text-gray-700 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20'
              }`}
            >
              {label}
              {count > 0 && <span className="text-xs bg-white/30 px-2 py-1 rounded-xl">{count}</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8 space-y-6">
          {activeTab === "posts" && (
            posts.length === 0 ? (
              <div className="post-card p-16 text-center rounded-3xl">
                <Image className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No posts</h3>
                <p className="text-gray-600 text-lg">Posts will appear here when created.</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post._id} className="post-card hover:shadow-social p-6 rounded-3xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold">S</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{post.user.full_name}</h4>
                      <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-800 mb-4">{post.caption}</p>
                  {post.image && <img src={post.image} alt="" className="w-full rounded-2xl mb-4" />}
                  <div className="flex gap-6 pt-4 border-t border-gray-100 text-sm">
                    <button className="flex items-center gap-2 text-primary">
                      <Heart className="w-4 h-4" fill={post.likedByMe ? "#3B82F6" : "none"} />
                      {post.likesCount}
                    </button>
                    <span>{post.commentsCount} comments</span>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === "media" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {mediaPosts.map(post => (
                post.image && (
                  <Link
                    key={post._id}
                    to={`/posts/${post._id}`}
                    className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all bg-gradient-to-br from-slate-100 to-slate-200"
                  >
                    <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                )
              ))}
              {mediaPosts.length === 0 && (
                <div className="col-span-full post-card p-16 text-center rounded-3xl">
                  <Image className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No media</h3>
                </div>
              )}
            </div>
          )}

          {activeTab === "likes" && (
            <div className="post-card p-16 text-center rounded-3xl">
              <Heart className="w-24 h-24 text-primary mx-auto mb-6 animate-pulse" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Likes Coming Soon</h3>
              <p className="text-gray-600">Liked posts will show here</p>
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEdit(false)}>
          <div className="post-card max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 p-2 rounded-2xl hover:bg-gray-100 transition" onClick={() => setShowEdit(false)}>
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <h3 className="text-2xl font-bold mb-8 text-center">Edit Profile</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name</label>
                <input type="text" defaultValue={profileUser.full_name} className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Bio</label>
                <textarea defaultValue={profileUser.bio} rows="3" className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 resize-vertical" />
              </div>
              <button className="w-full btn-primary py-4 text-lg font-bold shadow-xl hover:shadow-primary/50">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
