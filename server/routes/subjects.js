const express = require('express');
const Subject = require('../models/Subject');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Like = require('../models/Like');

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Get all subjects with first 3 comments and comment count.
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subjects = await Subject.find().populate('userId', 'email name').sort({ timestamp: -1 });
    // For each subject, count comments
    const Comment = require('../models/Comment');

    const subjectsWithCommentsAndCounts = await Promise.all(subjects.map(async (subject) => {
      
      // Get comments for this subject, limit to first 3
      const comments = await Comment.find({ subjectId: subject._id })
        .populate('userId', 'email name')
        .sort({ timestamp: 1 })
        .limit(3);
        
        //Get comment count
      const count = await Comment.countDocuments({ subjectId: subject._id });

      //Get user's like/dislike for this subject
      const userVote = await Like.findOne({ 
        userId: req.user.userId, 
        targetId: subject._id 
      });

      return { 
        ...subject.toObject(), 
        commentCount: count,
        comments: comments,
        likeCount: subject.likeCount || 0,
        userVote: userVote ? userVote.voteType : null  // 'like', 'dislike', or null
      };

    }));
    res.json(subjectsWithCommentsAndCounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects.' });
  }
});

// Add a new subject (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, initialMessage } = req.body;
    const userId = req.user.userId;
    
    // Get the user's name from the database using the userId from JWT
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    if (!title || !initialMessage) {
      return res.status(400).json({ error: 'Title and initialMessage are required.' });
    }
    
    const subject = new Subject({ 
      title, 
      creatorName: user.name,  // Use the authenticated user's name
      initialMessage, 
      userId 
    });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single subject by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('userId', 'email name');
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subject.' });
  }
});

// ...existing code...

// Delete a subject (thread) by ID (requires authentication and owner check)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    // Only the creator can delete their subject
    if (subject.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this subject.' });
    }
    // Delete related comments
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ subjectId: subject._id });
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject and related comments deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subject.' });
  }
});

module.exports = router;
