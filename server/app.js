const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');


const app = express(); // <-- Define app before using it

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);


// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/discussion-board';
mongoose.connect(MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('Connected to:', MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Please check your MongoDB connection string and network connectivity');
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
