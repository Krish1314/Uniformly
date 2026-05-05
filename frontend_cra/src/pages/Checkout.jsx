import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { addressApi } from '../api/addressApi';
import { cartApi } from '../api/cartApi';
import { checkoutApi } from '../api/checkoutApi';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [contact, setContact] = useState({ fullName: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [addrRes, cartRes] = await Promise.all([
          addressApi.getAddresses(),
          cartApi.getCart(),
        ]);
        setAddresses(addrRes.data);
        setCart(cartRes.data);

        // Pre-fill from default address
        const def = addrRes.data.find(a => a.isDefault) || addrRes.data[0];
        if (def) {
          setSelectedAddressId(String(def.id));
          setContact({ fullName: def.fullName || '', phone: def.phone || '' });
        }
      } catch (err) {
        console.error('Failed to load checkout data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // When selected address changes, update contact info
  const handleAddressChange = (addrId) => {
    setSelectedAddressId(addrId);
    const addr = addresses.find(a => String(a.id) === addrId);
    if (addr) setContact({ fullName: addr.fullName || '', phone: addr.phone || '' });
  };

  const validate = () => {
    const errs = {};
    if (!contact.fullName.trim()) errs.fullName = 'Full name is required';
    if (!contact.phone.trim()) errs.phone = 'Phone number is required';
    if (!selectedAddressId) errs.address = 'Please select a shipping address';
    if (!paymentMethod) errs.paymentMethod = 'Please select a payment method';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const response = await checkoutApi.checkout({
        addressId: Number(selectedAddressId),
        paymentMethod,
      });
      await refreshCart();
      navigate(`/confirmation?orderId=${response.data.id}`);
    } catch (err) {
      console.error('Checkout failed', err);
      setErrors({ submit: 'Checkout failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container py-5 mt-5 text-center text-muted">Loading checkout...</div>;
  }

  if (!cart || cart.itemCount === 0) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h3 className="mb-3">Your cart is empty</h3>
        <Link to="/catalog" className="btn btn-solid rounded-pill px-4">Continue Shopping</Link>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h3 className="mb-3">No saved address found</h3>
        <p className="text-muted mb-4">Please add a shipping address before checking out.</p>
        <Link to="/address" className="btn btn-solid rounded-pill px-4">Add Address</Link>
      </div>
    );
  }

  const selectedAddr = addresses.find(a => String(a.id) === selectedAddressId);

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1">
        <h1 className="font-serif fw-bold mb-4 pb-4 border-bottom border-dark">Secure Checkout</h1>

        {errors.submit && (
          <div className="alert alert-danger mb-4">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-5 mt-2">
            {/* ── Left Column ── */}
            <div className="col-lg-8">

              {/* Step 1 – Contact Information */}
              <div className="info-block mb-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="step-number">1</div>
                  <h2 className="font-serif fw-bold fs-3 mb-0">Contact Information</h2>
                </div>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="fw-semibold mb-2">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control border p-3 ${errors.fullName ? 'is-invalid' : ''}`}
                      placeholder="Enter your full name"
                      value={contact.fullName}
                      onChange={e => setContact(p => ({ ...p, fullName: e.target.value }))}
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="fw-semibold mb-2">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control border p-3 ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="+91 00000 00000"
                      value={contact.phone}
                      onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                </div>
              </div>

              {/* Step 2 – Shipping Address */}
              <div className="info-block mb-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="step-number">2</div>
                  <h2 className="font-serif fw-bold fs-3 mb-0">Shipping Address</h2>
                </div>

                {errors.address && (
                  <div className="alert alert-danger py-2 mb-3">{errors.address}</div>
                )}

                <div className="row g-3 mb-3">
                  {addresses.map(addr => (
                    <div className="col-12" key={addr.id}>
                      <div
                        className={`radio-card ${String(addr.id) === selectedAddressId ? 'selected' : ''}`}
                        onClick={() => handleAddressChange(String(addr.id))}
                        style={{
                          border: String(addr.id) === selectedAddressId
                            ? '2px solid #111'
                            : '1px solid #ddd',
                          cursor: 'pointer',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: String(addr.id) === selectedAddressId ? '#f8f8f8' : '#fff',
                        }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <input
                            type="radio"
                            readOnly
                            checked={String(addr.id) === selectedAddressId}
                            className="mt-1"
                          />
                          <div>
                            <div className="fw-bold">{addr.fullName}
                              {addr.isDefault && (
                                <span className="badge ms-2" style={{ backgroundColor: '#111', fontSize: '0.65rem' }}>Default</span>
                              )}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.88rem' }}>
                              {addr.addressLine}, {addr.city}, {addr.state} – {addr.pincode}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>{addr.phone}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/address" className="text-decoration-none fw-medium" style={{ fontSize: '0.9rem', color: '#0d6efd' }}>
                  + Add a new address
                </Link>

                {selectedAddr && (
                  <div className="mt-3 p-3 rounded" style={{ backgroundColor: '#f0f4ff', fontSize: '0.9rem' }}>
                    <strong>Delivering to:</strong> {selectedAddr.addressLine}, {selectedAddr.city}, {selectedAddr.state} – {selectedAddr.pincode}
                  </div>
                )}
              </div>

              {/* Step 3 – Payment Method */}
              <div className="info-block mb-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="step-number">3</div>
                  <h2 className="font-serif fw-bold fs-3 mb-0">Payment Method</h2>
                </div>

                {errors.paymentMethod && (
                  <div className="alert alert-danger py-2 mb-3">{errors.paymentMethod}</div>
                )}

                <div className="row g-3">
                  {['UPI', 'Debit', 'Credit', 'NetBanking', 'COD'].map(method => (
                    <div className="col-12" key={method}>
                      <div
                        className="radio-card"
                        onClick={() => setPaymentMethod(method)}
                        style={{
                          border: paymentMethod === method ? '2px solid #111' : '1px solid #ddd',
                          cursor: 'pointer',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: paymentMethod === method ? '#f8f8f8' : '#fff',
                        }}
                      >
                        <input type="radio" readOnly checked={paymentMethod === method} className="me-3" />
                        <span className="fs-6 fw-medium">
                          {method === 'UPI' && '📱 UPI / QR Code'}
                          {method === 'Debit' && '💳 Debit Card'}
                          {method === 'Credit' && '💳 Credit Card'}
                          {method === 'NetBanking' && '🏦 Net Banking'}
                          {method === 'COD' && '💵 Cash on Delivery'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ── Right Column – Order Summary ── */}
            <div className="col-lg-4">
              <div className="summary-block sticky-top" style={{ top: '100px' }}>
                <h3 className="font-serif fw-bold mb-4 pb-2">Order Summary</h3>

                {/* Cart item list */}
                <div className="mb-3">
                  {cart.items?.map(item => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.9rem' }}>
                      <span className="text-muted">{item.name} × {item.quantity}</span>
                      <span className="fw-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="summary-row">
                  <span className="text-muted">Subtotal ({cart.itemCount} items)</span>
                  <span className="fw-medium">₹{Number(cart.subtotal).toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span className="text-muted">Shipping</span>
                  <span className="fw-medium">₹70</span>
                </div>

                <div className="summary-total border-top border-dark mt-4 pt-4">
                  <span className="fs-4">Total</span>
                  <div className="fs-3 fw-bold">₹{(Number(cart.subtotal) + 70).toLocaleString()}</div>
                </div>

                <button
                  type="submit"
                  className="btn btn-solid w-100 mt-4 px-4 py-3 fs-5"
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order...' : `Pay ₹${(Number(cart.subtotal) + 70).toLocaleString()}`}
                </button>

                <p className="text-center text-muted mt-3" style={{ fontSize: '0.78rem' }}>
                  🔒 All fields marked with <span className="text-danger">*</span> are required
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
