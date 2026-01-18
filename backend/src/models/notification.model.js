import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['like_post', 'like_reel', 'comment_post', 'follow', 'story_react', 'chat_message'],
    required: true
  },
  relatedUser: {  // Who triggered (liker, commenter)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },     // Null for non-post
  reel: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel' },     // Null for non-reel
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },   // Null for non-story
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },   // For messages
  isRead: {
    type: Boolean,
    default: false
  },
  message: String  // "user1 liked your post"
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, createdAt: -1 });
export const Notification = mongoose.model('Notification', notificationSchema);
