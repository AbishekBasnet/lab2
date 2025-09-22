const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { 
    type: String,
    required: true,
    maxlength: 1000 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  likeCount: { 
  type: Number, 
  default: 0 
},
userLikes: [{ 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'User' 
}],
userDislikes: [{ 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'User' 
}]
});

module.exports = mongoose.model('Comment', commentSchema);
