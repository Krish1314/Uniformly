import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { addressApi } from '../api/addressApi';
import { cartApi } from '../api/cartApi';
import { checkoutApi } from '../api/checkoutApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { user } = useAuth();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [contact, setContact] = useState({ fullName: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [failedPayment, setFailedPayment] = useState(null); // { orderNumber, reason }

  useEffect(() => {
    const load = async () => {
      try {
        const [addrRes, cartRes] = await Promise.all([
          addressApi.getAddresses(),
          cartApi.getCart(),
        ]);
        setAddresses(addrRes.data);
        setCart(cartRes.data);

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
    return errs;
  };

  // Called by either "Pay with Razorpay" or "Cash on Delivery" button
  const handleSubmit = async (chosenMethod) => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      // Step 1 — initialise checkout on backend
      const initRes = await checkoutApi.initCheckout({
        addressId: Number(selectedAddressId),
        paymentMethod: chosenMethod,
      });
      const { orderId, orderNumber, razorpayOrderId, razorpayKeyId, cod } = initRes.data;

      if (cod) {
        // COD — order is placed, no payment gateway needed
        await refreshCart();
        navigate(`/confirmation?orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber)}`);
        return;
      }

      // Step 2 — open Razorpay with ALL payment methods visible
      const options = {
        key: razorpayKeyId,
        amount: Math.round((Number(cart.subtotal) + 70) * 100), // paise
        currency: 'INR',
        name: 'Uniformly',
        description: `Order ${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: contact.fullName,
          email: user?.email || '',
          contact: contact.phone,
        },
        theme: { color: '#111827' },
        handler: async (response) => {
          // ✅ Payment captured by Razorpay — verify signature on backend
          try {
            await checkoutApi.verifyPayment({
              orderNumber,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            await refreshCart();
            // Navigate to confirmation page — status=success shows full order details
            navigate(`/confirmation?orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber)}&status=success`);
          } catch (verifyErr) {
            console.error('Signature verification failed', verifyErr);
            // Signature mismatch — treat as failed
            navigate(`/confirmation?orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber)}&status=failed&reason=verification`);
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the modal without paying — show inline retry message
            setSubmitting(false);
            setErrors({
              submit: `Payment window closed. Your order (${orderNumber}) is saved — click "Pay via Razorpay" again to complete payment.`,
            });
          },
        },
      };


      /* global Razorpay */
      const rzp = new window.Razorpay(options);

      // ❌ Payment explicitly failed at bank/card/UPI level
      rzp.on('payment.failed', (response) => {
        console.error('Payment failed', response.error);
        const failReason = response.error?.description || response.error?.reason || 'Payment was declined';
        const failCode   = response.error?.code || '';

        // Wait 3 s so Razorpay can show its own error screen, then close it
        setTimeout(async () => {
          rzp.close(); // dismiss the Razorpay window
          setSubmitting(false);

          // Tell the backend to mark this order as PAYMENT_FAILED
          try {
            await checkoutApi.markPaymentFailed(orderNumber);
          } catch (e) {
            console.warn('Could not mark order as failed on backend', e);
          }

          // Show our in-page payment failed popup
          setFailedPayment({ orderNumber, reason: failReason, code: failCode });
        }, 3000);
      });

      rzp.open();
      // submitting stays true until handler / ondismiss / payment.failed fires

    } catch (err) {
      console.error('Checkout failed', err);
      const data = err.response?.data;
      const message =
        (typeof data === 'string' ? data : null) ||
        data?.message ||
        data?.error ||
        'Checkout failed. Please try again.';
      setErrors({ submit: message });
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
  const totalAmount = Number(cart.subtotal) + 70;

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>

      {/* ── Payment Failed Modal Overlay ── */}
      {failedPayment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Payment failed"
          style={{
            position: 'fixed', inset: 0,
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setFailedPayment(null)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(8,8,8,0.55)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal card */}
          <div
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
              animation: 'modalSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {/* Red top stripe */}
            <div style={{ height: '6px', background: 'linear-gradient(90deg,#dc2626,#ef4444)' }} />

            {/* Body */}
            <div style={{ padding: '40px 36px 32px', textAlign: 'center' }}>

              {/* Animated ❌ icon */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '76px', height: '76px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#fee2e2,#fecaca)',
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(220,38,38,0.18)',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="#dc2626" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </div>

              {/* Headline */}
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, fontSize: '1.75rem',
                color: '#080808', marginBottom: '10px',
              }}>
                Payment Failed
              </h2>

              {/* Reason */}
              <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '6px' }}>
                {failedPayment.reason}
              </p>
              {failedPayment.code && (
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0' }}>
                  Code: {failedPayment.code}
                </p>
              )}

              {/* Order ref */}
              <div style={{
                display: 'inline-block',
                background: '#f4f6f8',
                borderRadius: '8px',
                padding: '8px 20px',
                margin: '18px 0 24px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#374151',
                border: '1px solid #e5e7eb',
              }}>
                Order Ref: {failedPayment.orderNumber}
              </div>

              {/* Reassurance */}
              <p style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '0.82rem',
                color: '#166534',
                marginBottom: '28px',
                lineHeight: 1.5,
              }}>
                ✅ No money has been deducted from your account.
                Your cart and address are still saved.
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button
                  onClick={() => setFailedPayment(null)}
                  style={{
                    background: '#080808',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px 24px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={e => e.target.style.background = '#222'}
                  onMouseLeave={e => e.target.style.background = '#080808'}
                >
                  🔄 Try Again
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => { setFailedPayment(null); handleSubmit('COD'); }}
                    style={{
                      flex: 1,
                      background: '#f4f6f8',
                      color: '#080808',
                      border: '1.5px solid #e0e0e0',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseEnter={e => e.target.style.background = '#e8eaec'}
                    onMouseLeave={e => e.target.style.background = '#f4f6f8'}
                  >
                    💵 Use COD Instead
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    style={{
                      flex: 1,
                      background: '#f4f6f8',
                      color: '#080808',
                      border: '1.5px solid #e0e0e0',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseEnter={e => e.target.style.background = '#e8eaec'}
                    onMouseLeave={e => e.target.style.background = '#f4f6f8'}
                  >
                    📦 View Orders
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Keyframe injected inline */}
          <style>{`
            @keyframes modalSlideUp {
              from { opacity: 0; transform: translateY(40px) scale(0.96); }
              to   { opacity: 1; transform: translateY(0)   scale(1);    }
            }
          `}</style>
        </div>
      )}

      <div className="container py-5 mt-4 flex-grow-1">
        <h1 className="font-serif fw-bold mb-4 pb-4 border-bottom border-dark">Secure Checkout</h1>

        {errors.submit && (
          <div className="alert alert-danger mb-4">{errors.submit}</div>
        )}

        <form onSubmit={e => e.preventDefault()} noValidate>
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
                          border: String(addr.id) === selectedAddressId ? '2px solid #111' : '1px solid #ddd',
                          cursor: 'pointer',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          background: String(addr.id) === selectedAddressId ? '#f8f8f8' : '#fff',
                        }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          <input type="radio" readOnly checked={String(addr.id) === selectedAddressId} className="mt-1" />
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


            </div>

            {/* ── Right Column – Order Summary ── */}
            <div className="col-lg-4">
              <div className="summary-block sticky-top" style={{ top: '100px' }}>
                <h3 className="font-serif fw-bold mb-4 pb-2">Order Summary</h3>

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
                  <div className="fs-3 fw-bold">₹{totalAmount.toLocaleString()}</div>
                </div>

                {/* ── Payment action buttons ── */}
                <div className="mt-4 d-flex flex-column gap-3">

                  {/* Primary — Razorpay */}
                  <button
                    type="button"
                    className="btn btn-solid w-100 py-3"
                    disabled={submitting}
                    onClick={() => handleSubmit('ONLINE')}
                    style={{ fontSize: '1rem', fontWeight: 600, borderRadius: '10px', letterSpacing: '0.01em' }}
                  >
                    {submitting
                      ? <span>Processing… <span className="spinner-border spinner-border-sm ms-2" /></span>
                      : <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="me-2" style={{verticalAlign:'-3px'}}>
                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0V4zm0 3h16v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V7zm3 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1H3zm2 0a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1H5z"/>
                          </svg>
                          Pay ₹{totalAmount.toLocaleString()} with Razorpay
                        </span>
                    }
                  </button>

                  {/* Divider */}
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
                  </div>

                  {/* Secondary — COD */}
                  <button
                    type="button"
                    className="btn btn-outline w-100 py-3"
                    disabled={submitting}
                    onClick={() => handleSubmit('COD')}
                    style={{ fontSize: '0.95rem', fontWeight: 600, borderRadius: '10px', border: '1.5px solid #111' }}
                  >
                    💵 Cash on Delivery
                  </button>
                </div>

                <p className="text-center text-muted mt-3" style={{ fontSize: '0.72rem', lineHeight: 1.5 }}>
                  🔒 Razorpay is PCI-DSS compliant. Your payment info is never stored on our servers.
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
