import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel' },  // Optional
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 500
  },
  parentComment: {  // Reply to comment
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment',
    default: null
  },
  replies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment' 
  }],
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: true
});

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ reel: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

export const Comment = mongoose.model('Comment', commentSchema);
