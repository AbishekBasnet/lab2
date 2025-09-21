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
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state for creating thread
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Response form state
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyText, setReplyText] = useState('');

  // Load/save to localStorage so data persists across reloads
  // Load threads from backend
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/subjects', { headers: { Authorization: `Bearer ${token}` } });
        setThreads(res.data);
        if (res.data.length) setSelectedThreadId(res.data[0]._id);
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
    if (!newTitle.trim() || !newAuthor.trim() || !newMessage.trim()) return;
    if (!token) {
      alert('Please log in first.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/subjects', {
        title: newTitle.trim(),
        creatorName: newAuthor.trim(),
        initialMessage: newMessage.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });
      setThreads(prev => [res.data, ...prev]);
      setSelectedThreadId(res.data._id);
      setNewTitle('');
      setNewAuthor('');
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
  const addResponse = (e) => {
    e.preventDefault();
    alert('Replying to threads is not implemented in backend yet.');
    setReplyAuthor('');
    setReplyText('');
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
      if (remaining.length) setSelectedThreadId(remaining[0]._id);
      else setSelectedThreadId(null);
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

  // Select a thread to view messages
  const selectThread = (id) => {
    setSelectedThreadId(id);
  };

  const selectedThread = threads.find(t => t._id === selectedThreadId) || null;

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
            {/* Left column: create thread + thread list */}
            <div className="col-12 col-md-5 col-lg-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Create Thread</h5>
                  <form onSubmit={createThread}>
                    <div className="mb-2">
                      <input className="form-control" placeholder="Thread title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    </div>
                    <div className="mb-2">
                      <input className="form-control" placeholder="Your name" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} />
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

              <div className="mt-3">
                <h6 className="mb-2">Threads</h6>
                <div className="list-group">
                  {threads.length === 0 && <div className="text-muted small">No threads yet.</div>}
                  {threads.map(t => (
                    <button
                      key={t._id}
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${t._id === selectedThreadId ? 'active' : ''}`}
                      onClick={() => selectThread(t._id)}
                    >
                      <div>
                        <div className="fw-bold">{t.title}</div>
                        <div className="small">{t.creatorName} • {new Date(t.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="badge bg-secondary rounded-pill">{t.commentCount || 0}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: selected thread messages and reply box */}
            <div className="col-12 col-md-7 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  {!selectedThread && (
                    <div className="text-center text-muted">
                      Select a thread or create a new one to start the conversation.
                    </div>
                  )}

                  {selectedThread && (
                    <>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="mb-0">{selectedThread.title}</h5>
                          <small className="text-muted">{selectedThread.creatorName} • {new Date(selectedThread.timestamp).toLocaleString()}</small>
                        </div>
                        <div>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => deleteThread(selectedThread._id)}
                          >
                            Delete Thread
                          </button>
                        </div>
                      </div>

                      <div className="mb-3" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                        {/* Comments/messages would be shown here if implemented */}
                        <div className="text-muted">Replies not implemented yet.</div>
                      </div>

                      <form onSubmit={addResponse}>
                        <div className="row g-2">
                          <div className="col-12 col-sm-4">
                            <input className="form-control" placeholder="Your name" value={replyAuthor} onChange={(e) => setReplyAuthor(e.target.value)} />
                          </div>
                          <div className="col-12 col-sm-8">
                            <div className="input-group">
                              <input className="form-control" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                              <button className="btn btn-primary" type="submit">Reply</button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectList;
