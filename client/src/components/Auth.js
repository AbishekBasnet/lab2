import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';  // Import custom styling for the Auth page

// Auth component: Handles Login & Registration
function Auth({ setToken, setUser }) {
  // State to toggle between Register and Login
  const [isRegister, setIsRegister] = useState(false);

  // Form state: stores input values (email, password, name, phone)
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });

  // State for error handling
  const [error, setError] = useState('');

  // Update form state whenever user types in an input field
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle form submission for Login/Register
  const handleSubmit = async e => {
    e.preventDefault(); // Prevent default page reload
    setError('');       // Reset any previous error messages

    try {
      if (isRegister) {
        // Registration request
        await axios.post('/api/auth/register', form);
        setIsRegister(false); // Switch back to login after successful registration
      } else {
        // Login request
        const res = await axios.post('/api/auth/login', { 
          email: form.email, 
          password: form.password 
        });

        // Save token and user data in state + localStorage
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      // Show backend error message if available, otherwise generic message
      const backendError = err.response?.data?.error;
      setError(backendError || 'Authentication failed.');
    }
  };

  return (
    <div className="auth-container d-flex justify-content-center align-items-center">
      <div className="auth-card shadow">
        {/* Title changes based on mode (Register/Login) */}
        <h2 className="text-center mb-4">
          {isRegister ? '🔒Create Account' : 'Welcome Back!'}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Only show Name & Phone fields during Registration */}
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

          {/* Email input */}
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

          {/* Password input */}
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

          {/* Submit button */}
          <button type="submit" className="btn btn-gradient w-100">
            {isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        {/* Switch between Login and Register */}
        <div className="text-center mt-3">
          <span className="text-black"> 
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              className="btn btn-link p-0 switch-mode" 
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </span>
        </div>

        {/* Error message if authentication fails */}
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
