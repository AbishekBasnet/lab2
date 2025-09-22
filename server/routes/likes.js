const express = require('express');
const Like = require('../models/Like');
const Subject = require('../models/Subject');
const Comment = require('../models/Comment');
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

// Like or dislike a subject/comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { targetType, targetId, voteType } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!['Subject', 'Comment'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }
    if (!['like', 'dislike'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if target exists
    const Model = targetType === 'Subject' ? Subject : Comment;
    const target = await Model.findById(targetId);
    if (!target) {
      return res.status(404).json({ error: `${targetType} not found` });
    }

    // Check if user already voted
    const existingVote = await Like.findOne({ userId, targetId });
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type
        await Like.deleteOne({ userId, targetId });
        await updateTargetCounts(targetType, targetId);
        return res.json({ message: 'Vote removed', action: 'removed' });
      } else {
        // Update vote if different type
        existingVote.voteType = voteType;
        await existingVote.save();
        await updateTargetCounts(targetType, targetId);
        return res.json({ message: 'Vote updated', action: 'updated' });
      }
    } else {
      // Create new vote
      const newVote = new Like({ userId, targetType, targetId, voteType });
      await newVote.save();
      await updateTargetCounts(targetType, targetId);
      return res.json({ message: 'Vote added', action: 'added' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

// Helper function to update like counts
async function updateTargetCounts(targetType, targetId) {
  const Model = targetType === 'Subject' ? Subject : Comment;
  
  const likes = await Like.countDocuments({ targetId, voteType: 'like' });
  const dislikes = await Like.countDocuments({ targetId, voteType: 'dislike' });
  const likeCount = likes - dislikes;
  
  await Model.findByIdAndUpdate(targetId, { likeCount });
}

module.exports = router;