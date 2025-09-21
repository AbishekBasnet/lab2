import React, { useState } from 'react';
import axios from 'axios';

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
      // Always show backend error if present, else show a generic message
      const backendError = err.response?.data?.error;
      if (backendError) {
        setError(backendError);
      } else {
        setError('Authentication failed.');
      }
    }
  };

  const handleToggleMode = () => {
    setIsRegister(r => !r);
    setError('');
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4 col-xl-3">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 text-primary fw-bold">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input 
                    id="email"
                    name="email" 
                    type="email" 
                    className="form-control form-control-lg" 
                    placeholder="Enter your email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    id="password"
                    name="password" 
                    type="password" 
                    className="form-control form-control-lg" 
                    placeholder="Enter your password" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                {isRegister && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input 
                        id="name"
                        name="name" 
                        type="text"
                        className="form-control form-control-lg" 
                        placeholder="Enter your full name" 
                        value={form.name} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">Phone Number</label>
                      <input 
                        id="phone"
                        name="phone" 
                        type="tel"
                        className="form-control form-control-lg" 
                        placeholder="Enter your phone number (10 digits)" 
                        value={form.phone} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </>
                )}
                
                <div className="d-grid mb-3">
                  <button className="btn btn-primary btn-lg" type="submit">
                    {isRegister ? 'Create Account' : 'Sign In'}
                  </button>
                </div>
              </form>
              
              <div className="text-center">
                <button 
                  className="btn btn-link text-decoration-none p-0" 
                  onClick={handleToggleMode}
                >
                  {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                </button>
              </div>
              
              {error && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
