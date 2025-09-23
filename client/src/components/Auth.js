import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css'; // <-- Make sure this CSS file exists

function Auth({ setToken, setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await axios.post('/api/auth/register', form);
        setIsRegister(false);
      } else {
        const res = await axios.post('/api/auth/login', { email: form.email, password: form.password });
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      const backendError = err.response?.data?.error;
      setError(backendError || 'Authentication failed.');
    }
  };

  return (
    <div className="auth-container d-flex justify-content-center align-items-center">
      <div className="auth-card shadow">
        <h2 className="text-center mb-4">{isRegister ? '🔒Create Account' : 'Welcome Back!'}</h2>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="mb-3">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="Enter 10-digit phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="mb-3">
            <label>Email address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-gradient w-100">
            {isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-black"> 
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button className="btn btn-link p-0 switch-mode" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </span>
        </div>

        {error && (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Auth;
