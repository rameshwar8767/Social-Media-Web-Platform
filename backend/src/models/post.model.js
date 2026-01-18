import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 2200  // Instagram limit
  },
  media: [{
    url: {
      type: String,
      required: true
    },
    public_id: String,  // Cloudinary
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Remove old comments array, add:
commentsCount: { 
  type: Number, 
  default: 0,
  index: true 
},
topComments: [{  // Recent 3 for preview
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Comment'
}],

  saves: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ likes: 1 });
postSchema.index({ media: 1 });

export const Post = mongoose.model('Post', postSchema);
