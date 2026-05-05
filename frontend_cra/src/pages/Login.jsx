import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import Footer from '../components/Footer';

import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await login(form.email, form.password);
      if (data.user && data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1 d-flex align-items-center justify-content-center">
        
        <div className="auth-card shadow-sm border border-light">
          <h1 className="fw-bold mb-5" style={{ fontSize: '2rem' }}>Uniformly</h1>
          
          <h2 className="fw-bold fs-4 mb-4">Login to your account</h2>
          
          <form onSubmit={handleLogin}>
            {error && <div className="alert alert-danger p-2 mb-4" style={{ fontSize: '0.9rem' }}>{error}</div>}
            
            <div className="mb-4">
              <label className="d-flex justify-content-between mb-2 text-muted fw-medium" style={{ fontSize: '0.85rem' }}>
                Email
              </label>
              <input 
                type="email" 
                name="email"
                className="auth-input" 
                placeholder="abc@gmail.com" 
                value={form.email}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="mb-4">
              <label className="d-flex justify-content-between mb-2 text-muted fw-medium" style={{ fontSize: '0.85rem' }}>
                <span>Password</span>
                <Link to="#" className="text-decoration-none" style={{ color: '#0d6efd' }}>Forgot ?</Link>
              </label>
              <div className="position-relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  className="auth-input pe-5" 
                  placeholder="Enter your password" 
                  value={form.password}
                  onChange={handleChange}
                  required 
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  className="bi bi-eye position-absolute text-muted"
                  style={{ right: '14px', top: '14px', cursor: 'pointer' }}
                  viewBox="0 0 16 16"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? (
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709zm-5.205.994-.708-.708A4.498 4.498 0 0 1 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8l.195-.288c.335-.48.83-1.12 1.465-1.755.165-.165.337-.328.517-.486l-.708-.709C.94 6.28 0 8 0 8s3 5.5 8 5.5a7.028 7.028 0 0 0 2.79-.588l-.636-.68zM5.525 7.646l.708.708A2.5 2.5 0 0 0 10.475 8.354l-.708-.708A1.5 1.5 0 0 1 8 9.5a1.5 1.5 0 0 1-1.475-1.854zm4.95.708-.708-.708A2.5 2.5 0 0 0 5.525 7.646l.708.708A1.5 1.5 0 0 1 8 6.5a1.5 1.5 0 0 1 1.475 1.854z"/>
                  ) : (
                    <>
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                    </>
                  )}
                </svg>
              </div>
            </div>
            
            <button type="submit" className="btn-primary-blue w-100 mb-4">
              Login now
            </button>
            
            <div className="text-center text-muted" style={{ fontSize: '0.85rem' }}>
              Don't Have An Account? <Link to="/register" className="text-decoration-none fw-medium" style={{ color: '#0d6efd' }}>Sign Up</Link>
            </div>
          </form>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Login;
