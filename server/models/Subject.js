const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  creatorName: {
    type: String,
    required: true,
    maxlength: 100
  },
  initialMessage: {
    type: String,
    required: true,
    maxlength: 1000
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
likes: {
  type: Number,
  default: 0
},
dislikes: {
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

module.exports = mongoose.model('Subject', subjectSchema);
