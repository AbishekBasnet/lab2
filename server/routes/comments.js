const express = require('express');
const Comment = require('../models/Comment');
const Subject = require('../models/Subject');
const jwt = require('jsonwebtoken');
const router = express.Router();

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

// Get comments for a subject (first 75 chars)
router.get('/subject/:subjectId', authenticateToken, async (req, res) => {
  try {
    const comments = await Comment.find({ subjectId: req.params.subjectId })
      .populate('userId', 'email name')
      .sort({ timestamp: 1 });
    // Only return first 75 chars for each comment
    const preview = comments.map(c => ({
      _id: c._id,
      text: c.text.substring(0, 75),
      userId: c.userId,
      timestamp: c.timestamp
    }));
    res.json(preview);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// Get full comment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('userId', 'email name');
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comment.' });
  }
});

// Add a comment to a subject
router.post('/', authenticateToken, async (req, res) => {
  const { text, subjectId } = req.body;
  if (!text || !subjectId) {
    return res.status(400).json({ error: 'Text and subjectId are required.' });
  }
  if (text.length > 1000) {
    return res.status(400).json({ error: 'Comment text exceeds 1000 characters.' });
  }
  try {
    // Ensure subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    const comment = new Comment({
      text,
      userId: req.user.userId,
      subjectId
    });
    await comment.save();
    // Populate userId with name/email
    await comment.populate('userId', 'email name');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

module.exports = router;
