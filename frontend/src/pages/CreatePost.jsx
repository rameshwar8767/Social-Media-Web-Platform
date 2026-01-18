import React, { useEffect, useState, useRef, useCallback } from "react";
import { Image, X, Loader2, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// ✅ BUILT-IN USER (no AuthContext needed)
const useAuth = () => ({
  user: JSON.parse(localStorage.getItem('user') || 'null') || {
    _id: 'currentUser',
    full_name: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).full_name || 'You' : 'You',
    username: 'currentuser',
    profile_picture: null
  }
});

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [images]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [content, adjustTextareaHeight]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0 || images.length + files.length > 4) {
      toast.error("Max 4 images");
      return;
    }
    setImages(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!content.trim() && images.length === 0) {
      toast.error("Post cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('caption', content.trim());
      images.forEach(image => formData.append('images', image));

      const token = localStorage.getItem('token');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Post failed');
      
      toast.success("Post published! 🎉");
      setContent(""); setImages([]); 
      navigate('/feed/home', { replace: true });
    } catch (error) {
      toast.error('Failed to publish');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 post-card p-6 rounded-3xl shadow-social">
          <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-primary bg-clip-text text-transparent">
            Create Post
          </h1>
          <p className="text-gray-600 mt-2">{images.length ? `${images.length}/4 images` : 'Share your thoughts'}</p>
        </div>

        <form onSubmit={handleSubmit} className="post-card shadow-social rounded-3xl overflow-hidden">
          <div className="p-6 pb-4 flex items-start gap-4 border-b border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg overflow-hidden">
              <span className="text-white font-bold text-lg">{user.full_name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">{user.full_name}</h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>

          <div className="px-6 py-4">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full resize-none text-base outline-none bg-transparent min-h-[80px] max-h-[120px] placeholder-gray-500 text-gray-900 leading-relaxed"
              maxLength={5000}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{content.length}/5000</p>
          </div>

          {previews.length > 0 && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="group relative rounded-2xl shadow-md overflow-hidden">
                    <img src={src} alt="" className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-white shadow-lg rounded-2xl p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <label
                htmlFor="images"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer transition-all"
              >
                <Image className="w-5 h-5" />
                {images.length === 0 ? 'Add photos' : `+${4-images.length}`}
              </label>
              <input id="images" ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
              
              <button
                type="submit"
                disabled={loading || (!content.trim() && images.length === 0)}
                className={`ml-auto flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all ${
                  loading || (!content.trim() && images.length === 0)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-accent hover:shadow-primary/30 text-white hover:scale-[1.02]'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
