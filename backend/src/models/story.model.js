import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: [{
    url: { type: String, required: true },
    public_id: String,
    type: { type: String, enum: ['image', 'video'], required: true }
  }],
  caption: String,
  expiresAt: {
    type: Date,
    required: true,
    expires: '24h'  // TTL auto-delete!
  },
  viewers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewedAt: { type: Date, default: Date.now }
  }],
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

storySchema.index({ user: 1, expiresAt: 1 });
storySchema.index({ expiresAt: 1 });  // Cleanup

export const Story = mongoose.model('Story', storySchema);
