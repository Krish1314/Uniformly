import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { addressApi } from '../api/addressApi';

const Address = () => {
  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    label: '',
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const response = await addressApi.getAddresses();
      setAddresses(response.data);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'radio' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addressApi.createAddress(form);
      setForm({
        label: '',
        fullName: '',
        phone: '',
        addressLine: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
      setShowForm(false);
      loadAddresses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDelete = async (id) => {
    try {
      await addressApi.deleteAddress(id);
      loadAddresses();
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressApi.setDefaultAddress(id);
      loadAddresses();
    } catch (err) {
      console.error("Failed to set default address", err);
    }
  };

  if (loading) {
    return <div className="container py-5 mt-5 text-center">Loading addresses...</div>;
  }

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div className="mb-5">
          <Link to="/profile" className="text-dark text-decoration-none d-inline-flex align-items-center fs-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-arrow-left me-3 fw-bold" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back to profile
          </Link>
          <h1 className="font-serif fw-bold mb-2" style={{ fontSize: '4rem', letterSpacing: '-1px' }}>Saved Address</h1>
          <p className="text-muted fs-4">Manage delivery addresses for faster checkout</p>
        </div>

        {error && <div className="alert alert-danger p-3 mb-4">{error}</div>}

        {/* Toggle between Empty State and Form */}
        {!showForm ? (
          <div>
            <div className="d-flex justify-content-end mb-4">
              <button className="btn btn-solid rounded-3 px-4 py-2" onClick={() => setShowForm(true)}>
                + Add New Address
              </button>
            </div>
            
            {addresses.length === 0 ? (
              <div className="info-block d-flex flex-column align-items-center justify-content-center text-center py-5 mt-4" style={{ minHeight: '400px' }}>
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '120px', height: '120px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                </div>
                <h2 className="fw-bold fs-3 mb-2">No Saved Addresses</h2>
                <p className="text-muted fs-5 mb-5">Save your delivery addresses to skip filling them out at checkout</p>
                <button className="btn btn-solid rounded-3 px-4 py-2 mb-2" onClick={() => setShowForm(true)}>
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="row g-4 mt-2">
                {addresses.map((addr) => (
                  <div className="col-12" key={addr.id}>
                    <div className={`info-block p-4 border ${addr.defaultAddress ? 'border-dark border-2' : 'border-light'}`}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="d-flex align-items-center mb-2">
                            <span className="badge bg-dark px-3 py-2 me-2 rounded-pill fs-6">{addr.label || 'Home'}</span>
                            {addr.defaultAddress && <span className="text-primary fw-bold fs-6">Default Address</span>}
                          </div>
                          <h3 className="fw-bold fs-4 mb-1">{addr.fullName}</h3>
                          <p className="text-dark fs-5 mb-1">{addr.addressLine}</p>
                          <p className="text-muted fs-5 mb-2">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-secondary fs-6 mb-0">Phone: {addr.phone}</p>
                        </div>
                        <div className="d-flex flex-column gap-2 align-items-end">
                          {!addr.defaultAddress && (
                            <button className="btn btn-sm btn-outline-secondary fs-6" onClick={() => handleSetDefault(addr.id)}>
                              Set Default
                            </button>
                          )}
                          <button className="btn btn-sm btn-outline-danger fs-6" onClick={() => handleDelete(addr.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="info-block p-5 mt-4 position-relative">
            <h2 className="fw-bold fs-3 mb-5">Add New Address</h2>
            
            <form className="row g-4" onSubmit={handleSubmit}>
              <div className="col-md-6 mb-2">
                <label className="fw-bold fs-5 mb-2">Label (e.g. Home, Office)</label>
                <input 
                  type="text" 
                  name="label"
                  className="form-control border-0 p-3 fs-5" 
                  placeholder="Home"
                  value={form.label}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-2">
                <label className="fw-bold fs-5 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  className="form-control border-0 p-3 fs-5" 
                  placeholder="Krish Patel"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-12 mb-2">
                <label className="fw-bold fs-5 mb-2">Phone Number</label>
                <input 
                  type="text" 
                  name="phone"
                  className="form-control border-0 p-3 fs-5" 
                  placeholder="+91 1234567890"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-12 mb-2">
                <label className="fw-bold fs-5 mb-2">Address</label>
                <input 
                  type="text" 
                  name="addressLine"
                  className="form-control border-0 p-3 fs-5" 
                  placeholder="Flat no, Building, Area"
                  value={form.addressLine}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-2">
                <label className="fw-bold fs-5 mb-2">City</label>
                <input 
                  type="text" 
                  name="city"
                  className="form-control border-0 p-3 fs-5"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-2">
                <label className="fw-bold fs-5 mb-2">State</label>
                <input 
                  type="text" 
                  name="state"
                  className="form-control border-0 p-3 fs-5" 
                  placeholder="Maharashtra"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-4">
                <label className="fw-bold fs-5 mb-2">Pincode</label>
                <input 
                  type="text" 
                  name="pincode"
                  className="form-control border-0 p-3 fs-5" 
                  placeholder="123456"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-4 d-flex align-items-end pb-3">
                <div className="form-check d-flex align-items-center">
                  <input 
                    className="form-check-input me-3" 
                    type="checkbox" 
                    name="isDefault" 
                    id="defaultAddress1" 
                    style={{ width: '24px', height: '24px', accentColor: '#080808' }}
                    checked={form.isDefault}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fs-5 text-dark" htmlFor="defaultAddress1">
                    Set as default Address
                  </label>
                </div>
              </div>

              <div className="col-12 d-flex justify-content-center gap-4 mt-4">
                <button type="button" className="btn btn-outline-dark bg-white fs-5 px-5 py-2 fw-medium rounded-3" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-solid fs-5 px-5 py-2 rounded-3">
                  Add Address
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default Address;
