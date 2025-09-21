import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import Auth from './components/Auth';
import SubjectList from './components/SubjectList';


function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check for saved token on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing saved user:", e);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // NOTE: Do not clear token on mount — keep saved JWT so authenticated requests work

  // Load subjects when token changes
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios.get('/api/subjects', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setSubjects(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching subjects:", err);
        setSubjects([]);
        setLoading(false);
      });
  }, [token]);

  // Render different views based on state
  if (!token) {
    return <Auth setToken={setToken} setUser={setUser} />;
  }

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <SubjectList 
      subjects={subjects}
      token={token}
      setSubjects={setSubjects}
      user={user}
      setToken={setToken}
    />
  );
}

export default App;

