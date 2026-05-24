import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

/* ─── Small sub-components ─────────────────────────────────────────── */

const StatusBadge = ({ paymentStatus }) => {
  const isPaid = paymentStatus === 'PAID';
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '0.78rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
      background: isPaid ? '#d1fae5' : '#fef3c7',
      color: isPaid ? '#065f46' : '#92400e',
    }}>
      {paymentStatus || 'PENDING'}
    </span>
  );
};

/* ─── Main Component ────────────────────────────────────────────────── */

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const [downloading, setDownloading] = useState(false);

  const orderId     = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const status      = searchParams.get('status');   // 'success' | 'failed' | null (COD/pending)
  const reason      = searchParams.get('reason');   // failure reason from Razorpay

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  const isFailed  = status === 'failed';
  const isSuccess = status === 'success';

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const response = await api.get(`/orders/${order.id}/invoice`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download invoice', err);
      alert('Could not download invoice. Please try again later.');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    api.get(`/orders/${orderId}`)
      .then(res  => { setOrder(res.data); })
      .catch(err => { console.error('Failed to load order', err); })
      .finally(() => setLoading(false));
  }, [orderId]);

  /* ── Payment Failed ── */
  if (isFailed) {
    return (
      <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
        <div className="container py-5 mt-4 flex-grow-1" style={{ maxWidth: '720px' }}>
          <div className="info-block text-center position-relative overflow-hidden py-5">
            {/* Red top bar */}
            <div className="position-absolute top-0 start-0 w-100" style={{ height: '8px', backgroundColor: '#ef4444' }} />

            {/* ❌ Icon */}
            <div className="d-flex justify-content-center mb-4">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '72px', height: '72px', backgroundColor: '#fee2e2', color: '#dc2626' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </div>
            </div>

            <h1 className="font-serif fw-bold mb-3" style={{ color: '#dc2626' }}>Payment Failed</h1>

            <p className="text-muted fs-5 mb-2 px-3">
              Your payment could not be processed.
              {reason && reason !== 'verification' && (
                <span className="d-block mt-1" style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>
                  Reason: {decodeURIComponent(reason)}
                </span>
              )}
              {reason === 'verification' && (
                <span className="d-block mt-1" style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>
                  Signature verification failed — your money has NOT been debited.
                </span>
              )}
            </p>

            {orderNumber && (
              <div className="bg-white rounded px-4 py-2 d-inline-block fw-medium my-3 shadow-sm border"
                style={{ fontSize: '0.85rem' }}>
                Order Reference : <span className="fw-bold">{orderNumber}</span>
              </div>
            )}

            <p className="text-muted mb-5 px-4" style={{ fontSize: '0.9rem' }}>
              No money has been deducted from your account. You can retry your payment
              or choose Cash on Delivery instead.
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 px-4">
              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-solid rounded-pill px-5 py-3 fs-5"
              >
                🔄 Retry Payment
              </button>
              <Link to="/orders" className="btn btn-outline-secondary rounded-pill px-4 py-3 fs-5">
                View Orders
              </Link>
              <Link to="/catalog" className="btn btn-outline-secondary rounded-pill px-4 py-3 fs-5">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
        <div className="container py-5 mt-5 text-center text-muted flex-grow-1">
          <div className="spinner-border mb-3" style={{ width: '2rem', height: '2rem' }} role="status" />
          <p>Loading your order details…</p>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Success / COD / Pending ── */
  const isPending = order?.paymentStatus === 'PENDING';
  const isCOD     = order?.paymentMethod === 'COD';
  const accentColor = isSuccess || (!isPending) ? '#16a34a' : '#d97706';
  const accentBg    = isSuccess || (!isPending) ? '#e2f2e9'  : '#fef3c7';

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1" style={{ maxWidth: '900px' }}>

        {/* ── Hero Block ── */}
        <div className="info-block text-center mb-4 position-relative overflow-hidden pt-5 pb-5">
          {/* Top accent bar */}
          <div className="position-absolute top-0 start-0 w-100" style={{ height: '8px', backgroundColor: accentColor }} />

          {/* Icon */}
          <div className="d-flex justify-content-center mb-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '64px', height: '64px', backgroundColor: accentBg, color: accentColor }}>
              {isPending && isCOD ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                </svg>
              )}
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-serif fw-bold mb-3">
            {isSuccess
              ? 'Payment Successful! 🎉'
              : isCOD
                ? 'Order Placed — Pay on Delivery'
                : 'Order Confirmed!'}
          </h1>

          {/* Subtitle */}
          <p className="text-dark fs-5 mb-4 px-3" style={{ lineHeight: '1.6' }}>
            {isSuccess ? (
              <>
                Your payment was confirmed and your order is being prepared.
                {user?.email && (
                  <span className="d-block mt-1" style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    Confirmation sent to <strong>{user.email}</strong>
                  </span>
                )}
              </>
            ) : isCOD ? (
              <>Pay ₹{order ? Number(order.totalAmount).toLocaleString() : '—'} when your order arrives. Our team will contact you.</>
            ) : (
              <>Thank you{user?.firstName ? `, ${user.firstName}` : ''}! Your order has been placed successfully.</>
            )}
          </p>

          {/* Order number badge */}
          <div className="bg-white rounded px-4 py-2 d-inline-block fw-medium mb-5 shadow-sm border">
            Order # <span className="fw-bold">{order?.orderNumber || orderNumber || '—'}</span>
            {order?.paymentStatus && (
              <span className="ms-3"><StatusBadge paymentStatus={order.paymentStatus} /></span>
            )}
          </div>

          {/* CTA buttons */}
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <Link to="/orders" className="fw-bold text-dark text-decoration-none d-flex align-items-center justify-content-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14z"/>
              </svg>
              Track Your Order
            </Link>
            {!isFailed && order && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="btn btn-outline-dark py-2 px-4 rounded-pill fs-6 d-inline-flex align-items-center justify-content-center gap-2"
                style={{ fontWeight: 600 }}
              >
                {downloading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                    Downloading...
                  </>
                ) : (
                  <>📄 Download Invoice</>
                )}
              </button>
            )}
            <Link to="/catalog" className="btn btn-solid py-2 px-5 rounded-pill fs-6">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── Order details (only when order loaded) ── */}
        {order && (
          <>
            {/* Summary grid */}
            <div className="row g-4 mb-4">

              {/* Delivery address */}
              <div className="col-md-6">
                <div className="info-block h-100 p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                    </svg>
                    <span className="fw-bold fs-6">Delivery Address</span>
                  </div>
                  <div className="fw-semibold mb-1">{order.address?.fullName}</div>
                  <div className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {order.address?.addressLine}<br />
                    {order.address?.city}, {order.address?.state} – {order.address?.pincode}<br />
                    📞 {order.address?.phone}
                  </div>
                </div>
              </div>

              {/* Payment summary */}
              <div className="col-md-6">
                <div className="info-block h-100 p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0V4zm0 3h16v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V7zm3 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1H3zm2 0a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1H5z"/>
                    </svg>
                    <span className="fw-bold fs-6">Payment Summary</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
                    <span>Method</span><span className="fw-semibold text-dark">{order.paymentMethod}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
                    <span>Status</span><StatusBadge paymentStatus={order.paymentStatus} />
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
                    <span>Subtotal</span><span className="fw-semibold text-dark">₹{Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
                    <span>Shipping</span><span>₹{Number(order.shippingFee).toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between pt-2 mt-2 border-top" style={{ fontSize: '1rem' }}>
                    <span className="fw-bold">{order.paymentStatus === 'PAID' ? 'Total Paid' : 'Total Due'}</span>
                    <span className="fw-bold fs-5">₹{Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items list */}
            <div className="rounded overflow-hidden border" style={{ background: '#fff' }}>
              <div className="px-4 py-3 border-bottom bg-light d-flex align-items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                </svg>
                <span className="fw-semibold">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''} in this order</span>
              </div>

              {order.items?.map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-3 px-4 py-3 border-bottom"
                  style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>

                  {/* Product image */}
                  {item.imageUrl ? (
                    <div className="flex-shrink-0 rounded overflow-hidden border"
                      style={{ width: '64px', height: '64px', background: '#f3f4f6' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 rounded border d-flex align-items-center justify-content-center"
                      style={{ width: '64px', height: '64px', background: '#f3f4f6', color: '#9ca3af' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                        <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3z"/>
                      </svg>
                    </div>
                  )}

                  {/* Item details */}
                  <div className="flex-grow-1">
                    <div className="fw-semibold mb-1" style={{ fontSize: '0.95rem' }}>{item.productName}</div>
                    <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {item.schoolName} &nbsp;·&nbsp; Size: <strong>{item.size}</strong> &nbsp;·&nbsp; {item.color}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.82rem' }}>
                      ₹{Number(item.unitPrice).toLocaleString()} × {item.quantity}
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="fw-bold" style={{ fontSize: '0.95rem', flexShrink: 0 }}>
                    ₹{Number(item.totalPrice).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* No order loaded (navigated directly without orderId) */}
        {!order && !loading && (
          <div className="text-center py-4 text-muted">
            <p>Order details could not be loaded.</p>
            <Link to="/orders" className="btn btn-solid rounded-pill px-4">View All Orders</Link>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
