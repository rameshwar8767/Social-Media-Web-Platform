import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 2200
  },
  video: {
    url: { type: String, required: true },
    public_id: String,
    duration: Number  // Seconds
  },
  thumbnail: {
    url: String,
    public_id: String
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true }
  }],
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

reelSchema.index({ user: 1, createdAt: -1 });
reelSchema.index({ views: -1 });  // Trending

export const Reel = mongoose.model('Reel', reelSchema);
