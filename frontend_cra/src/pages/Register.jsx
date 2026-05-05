import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1 d-flex align-items-center justify-content-center">
        
        <div className="auth-card shadow-sm border border-light">
          <h1 className="fw-bold mb-5" style={{ fontSize: '2rem' }}>Uniformly</h1>
          
          <h2 className="fw-bold fs-4 mb-4">Create an account</h2>
          
          <form onSubmit={handleRegister}>
            {error && <div className="alert alert-danger p-2 mb-4" style={{ fontSize: '0.9rem' }}>{error}</div>}

            <div className="row">
              <div className="col-md-6 mb-4">
                <label className="mb-2 text-muted fw-medium" style={{ fontSize: '0.85rem' }}>First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  className="auth-input" 
                  placeholder="John" 
                  value={form.firstName}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="col-md-6 mb-4">
                <label className="mb-2 text-muted fw-medium" style={{ fontSize: '0.85rem' }}>Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  className="auth-input" 
                  placeholder="Doe" 
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 text-muted fw-medium" style={{ fontSize: '0.85rem' }}>Email</label>
              <input 
                type="email" 
                name="email"
                className="auth-input" 
                placeholder="john.doe@gmail.com" 
                value={form.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 text-muted fw-medium" style={{ fontSize: '0.85rem' }}>Phone</label>
              <input 
                type="text" 
                name="phone"
                className="auth-input" 
                placeholder="9876543210" 
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="mb-2 text-muted fw-medium" style={{ fontSize: '0.85rem' }}>Password</label>
              <input 
                type="password" 
                name="password"
                className="auth-input" 
                placeholder="Enter your password" 
                value={form.password}
                onChange={handleChange}
                required 
              />
            </div>
            
            <button type="submit" className="btn-primary-blue w-100 mb-3">
              Create account
            </button>
            
            <div className="text-center text-muted" style={{ fontSize: '0.85rem' }}>
              Already Have An Account ? <Link to="/login" className="text-decoration-none fw-medium" style={{ color: '#0d6efd' }}>Log In</Link>
            </div>
          </form>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Register;
