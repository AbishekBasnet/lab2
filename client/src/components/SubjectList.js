import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Simple in-memory/localStorage thread system:
// - create thread
// - respond to thread
// - delete thread (only when there are no responses)
// - delete a response
// - list threads and list messages for selected thread
const SubjectList = ({ subjects: initialSubjects = [], token = null, user = null, setToken }) => {
  // All threads stored as { id, title, author, createdAt, messages: [{id, author, text, createdAt}] }
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for creating thread
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Response form state
  const [replyTexts, setReplyTexts] = useState({}); // Object to store reply text for each thread
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  // Load/save to localStorage so data persists across reloads
  // Load threads from backend
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/subjects', { headers: { Authorization: `Bearer ${token}` } });
        setThreads(res.data);
        
      } catch (err) {
        if (err.response?.status === 403) {
          alert('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (setToken) setToken(null);
          window.location.reload();
        } else {
          setThreads([]);
        }
      }
      setLoading(false);
    };
    if (token) fetchSubjects();
    else {
      setThreads(initialSubjects || []);
      setLoading(false);
    }
  }, [token]);

  // Create a new thread (subject)
  const createThread = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;
    if (!token) {
      alert('Please log in first.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/subjects', {
        title: newTitle.trim(),
        initialMessage: newMessage.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });
      setThreads(prev => [res.data, ...prev]);
      
      setNewTitle('');
      setNewMessage('');
    } catch (err) {
      if (err.response?.status === 403) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (setToken) setToken(null);
        window.location.reload();
      } else {
        alert('Failed to create thread: ' + (err.response?.data?.error || err.message));
      }
    }
    setLoading(false);
  };

  // Add a response to a thread (not implemented, would require backend API for comments)
  const addResponse = async (e, threadId) => {
    e.preventDefault();
    const currentReplyText = replyTexts[threadId] || '';
    if (!currentReplyText.trim()) {
      alert('Reply text is required.');
      return;
    }
    
    if (!token) {
      alert('Please log in first.');
      return;
    }
    
    try {
      const res = await axios.post('/api/comments', {
        text: currentReplyText.trim(),
        subjectId: threadId
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // Refresh the threads to show the new comment
      const updatedRes = await axios.get('/api/subjects', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setThreads(updatedRes.data);
      
      // Clear only this thread's reply text
      setReplyTexts(prev => ({
        ...prev,
        [threadId]: ''
      }));
    } catch (err) {
      alert('Failed to add comment: ' + (err.response?.data?.error || err.message));
    }
  };

  // Delete a response by id (not implemented)
  const deleteResponse = (threadId, messageId) => {
    alert('Deleting responses is not implemented in backend yet.');
  };

  // Delete a thread using backend API
  const deleteThread = async (threadId) => {
    console.log('Token:', token);
    console.log('Thread ID:', threadId);
    if (!window.confirm('Are you sure you want to delete this thread?')) return;
    if (!token) {
      alert('Please log in first.');
      return;
    }
    setLoading(true);
    try {
      console.log('Sending DELETE request...');
      await axios.delete(`/api/subjects/${threadId}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Delete successful');
      setThreads(prev => prev.filter(t => t._id !== threadId));
      const remaining = threads.filter(t => t._id !== threadId);
      

    } catch (err) {
      console.log('Delete error:', err.response);
      if (err.response?.status === 403) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (setToken) setToken(null);
        window.location.reload();
      } else {
        alert('Failed to delete thread: ' + (err.response?.data?.error || err.message));
      }
    }
    setLoading(false);
  };


  const handleVote = async (targetType, targetId, voteType) => {
    if (!token) {
      alert('Please log in first.');
      return;
    }

    try {
      await axios.post('/api/likes', {
        targetType,
        targetId,
        voteType
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Refresh threads to show updated counts
      const updatedRes = await axios.get('/api/subjects', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setThreads(updatedRes.data);
    } catch (err) {
      alert('Failed to vote: ' + (err.response?.data?.error || err.message));
    }
  };

  

  

  if (loading) {
    return <div className="container text-center mt-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-end p-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            // Logout locally
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (setToken) setToken(null);
            window.location.reload();
          }}
        >
          Logout
        </button>
      </div>
      <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="w-100" style={{ maxWidth: 1100, padding: '1rem' }}>
          <div className="row justify-content-center">
            {/* Create thread form - full width */}
            <div className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Create Thread</h5>
                  <form onSubmit={createThread}>
                    <div className="mb-2">
                      <input className="form-control" placeholder="Thread title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    </div>
                    <div className="mb-2">
                      <textarea className="form-control" rows={3} placeholder="Initial message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    </div>
                    <div className="d-grid gap-2">
                      <button className="btn btn-primary btn-sm" type="submit">Create</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* All threads with comments - full width */}
            <div className="col-12">
              {threads.length === 0 && <div className="text-muted text-center">No threads yet.</div>}
              {threads.map(thread => (
                <div key={thread._id} className="card shadow-sm mb-4">
                  <div className="card-body">
                    {/* Thread header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">{thread.title}</h5>
                        <small className="text-muted">{thread.creatorName} • {new Date(thread.timestamp).toLocaleString()}</small>
                      </div>
                      <div className="d-flex align-items-center mt-2">
                        <button 
                          className={`btn btn-sm me-2 ${thread.userVote === 'like' ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => handleVote('Subject', thread._id, 'like')}
                        >
                          👍 {thread.likeCount >= 0 ? thread.likeCount : 0}
                        </button>
                        <button 
                          className={`btn btn-sm me-2 ${thread.userVote === 'dislike' ? 'btn-danger' : 'btn-outline-danger'}`}
                          onClick={() => handleVote('Subject', thread._id, 'dislike')}
                        >
                          👎
                        </button>
                        <span className="text-muted">Score: {thread.likeCount || 0}</span>
                      </div>
                      <div>
                        <span className="badge bg-secondary me-2">{thread.commentCount || 0} replies</span>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => deleteThread(thread._id)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Thread initial message */}
                    <div className="mb-3 p-3 bg-light rounded">
                      <p className="mb-0">{thread.initialMessage}</p>
                    </div>

                    {/* Comments section */}
                    <div className="mb-3">
                      <h6>Recent Comments:</h6>
                      {thread.comments && thread.comments.length > 0 ? (
                        <div>
                          {thread.comments.map(comment => (
                            <div key={comment._id} className="border-start border-3 ps-3 mb-2">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <small className="text-muted">{comment.userId?.name || 'Anonymous'} • {new Date(comment.timestamp).toLocaleString()}</small>
                                  <p className="mb-1 mt-1">{comment.text}</p>
                                </div>
                                <div className="d-flex align-items-center">
                                  <button 
                                    className={`btn btn-sm btn-outline-success me-1`}
                                    onClick={() => handleVote('Comment', comment._id, 'like')}
                                  >
                                    👍 {comment.likeCount || 0}
                                  </button>
                                  <button 
                                    className={`btn btn-sm btn-outline-danger`}
                                    onClick={() => handleVote('Comment', comment._id, 'dislike')}
                                  >
                                    👎
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                          ))}
                          {thread.commentCount > 3 && (
                            <small className="text-muted">... and {thread.commentCount - 3} more replies</small>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted mb-0">No comments yet. Be the first to reply!</p>
                      )}
                    </div>

                    {/* Reply form for this thread */}
                    <form onSubmit={(e) => addResponse(e, thread._id)}>
                      <div className="input-group">
                        <input 
                          className="form-control" 
                          placeholder="Write a reply..." 
                          value={replyTexts[thread._id] || ''} 
                          onChange={(e) => setReplyTexts(prev => ({
                            ...prev,
                            [thread._id]: e.target.value
                          }))} 
                        />
                        <button className="btn btn-primary" type="submit">Reply</button>
                      </div>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectList;
