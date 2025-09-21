const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, maxlength: 1000 },
  userName: { type: String, required: true, maxlength: 100 },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
