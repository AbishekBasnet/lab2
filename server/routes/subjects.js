const express = require('express');
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

// Get all subjects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subjects = await Subject.find().populate('userId', 'email name').sort({ timestamp: -1 });
    // For each subject, count comments
    const Comment = require('../models/Comment');
    const subjectsWithCounts = await Promise.all(subjects.map(async (subject) => {
      const count = await Comment.countDocuments({ subjectId: subject._id });
      return { ...subject.toObject(), commentCount: count };
    }));
    res.json(subjectsWithCounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects.' });
  }
});

// Add a new subject (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, creatorName, initialMessage } = req.body;
    const userId = req.user.userId;
    if (!title || !creatorName || !initialMessage) {
      return res.status(400).json({ error: 'Title, creatorName and initialMessage are required.' });
    }
    const subject = new Subject({ title, creatorName, initialMessage, userId });
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
