const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  targetType: { 
    type: String, 
    enum: ['Subject', 'Comment'], 
    required: true 
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'targetType'  // Dynamic reference based on targetType
  },
  voteType: { 
    type: String, 
    enum: ['like', 'dislike'], 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Ensure one vote per user per target
likeSchema.index({ userId: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);