import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { orderApi } from '../api/orderApi';

/* ─── Which statuses allow cancellation (must match backend) ──────── */
const CANCELLABLE = new Set(['PLACED', 'PACKED']);

/* ─── Status config ──────────────────────────────────────────────── */
const STATUS_CONFIG = {
  PLACED:          { label: 'Order Placed',    bg: '#f3f4f6', color: '#374151', icon: '📋' },
  PACKED:          { label: 'Packed',          bg: '#eff6ff', color: '#1d4ed8', icon: '📦' },
  SHIPPED:         { label: 'Shipped',         bg: '#f0fdf4', color: '#166534', icon: '🚚' },
  DELIVERED:       { label: 'Delivered',       bg: '#dcfce7', color: '#15803d', icon: '✅' },
  CANCELLED:       { label: 'Cancelled',       bg: '#fef2f2', color: '#b91c1c', icon: '✕'  },
  PAYMENT_FAILED:  { label: 'Payment Failed',  bg: '#fef2f2', color: '#b91c1c', icon: '⚠'  },
};

const PAYMENT_STATUS_CONFIG = {
  PAID:             { label: 'Paid',             bg: '#d1fae5', color: '#065f46' },
  PENDING:          { label: 'Pending',          bg: '#fef3c7', color: '#92400e' },
  FAILED:           { label: 'Failed',           bg: '#fee2e2', color: '#991b1b' },
  CANCELLED:        { label: 'Cancelled',        bg: '#f3f4f6', color: '#6b7280' },
  REFUND_INITIATED: { label: 'Refund Initiated', bg: '#ede9fe', color: '#5b21b6' },
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#f3f4f6', color: '#374151', icon: '' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 12px', borderRadius: '999px',
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.03em',
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const PaymentPill = ({ status, method }) => {
  if (method === 'COD' && status === 'PENDING') {
    return (
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
        fontSize: '0.7rem', fontWeight: 600, background: '#f3f4f6', color: '#374151',
      }}>
        💵 Cash on Delivery
      </span>
    );
  }
  const cfg = PAYMENT_STATUS_CONFIG[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
      fontSize: '0.7rem', fontWeight: 600, background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
};

/* ─── Cancel Confirmation Modal ──────────────────────────────────── */
const CancelModal = ({ order, onClose, onCancelled }) => {
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult]         = useState(null); // { refundInitiated, message }
  const isPaid = order.paymentStatus === 'PAID';

  const handleConfirm = async () => {
    setCancelling(true);
    try {
      const res = await orderApi.cancelOrder(order.id);
      setResult(res.data);
      onCancelled(); // refresh list in background
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order. Please contact support.');
      onClose();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      {/* Backdrop */}
      <div
        onClick={!result ? onClose : undefined}
        style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.55)', backdropFilter: 'blur(4px)' }}
      />

      {/* Card */}
      <div style={{
        position: 'relative', background: '#fff', borderRadius: '20px',
        maxWidth: '460px', width: '100%', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        animation: 'cancelSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>

        {/* Top stripe */}
        <div style={{
          height: '5px',
          background: result
            ? (result.refundInitiated ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : 'linear-gradient(90deg,#16a34a,#4ade80)')
            : 'linear-gradient(90deg,#dc2626,#f87171)',
        }} />

        <div style={{ padding: '32px 32px 28px', textAlign: 'center' }}>

          {/* ── SUCCESS STATE ── */}
          {result ? (
            <>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '68px', height: '68px', borderRadius: '50%',
                background: result.refundInitiated ? 'linear-gradient(135deg,#ede9fe,#ddd6fe)' : 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
                marginBottom: '20px', fontSize: '2rem',
              }}>
                {result.refundInitiated ? '💸' : '✅'}
              </div>

              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px' }}>
                Order Cancelled
              </h3>

              <p style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {result.message}
              </p>

              {result.refundInitiated && (
                <div style={{
                  background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: '10px',
                  padding: '14px 16px', fontSize: '0.82rem', color: '#5b21b6',
                  marginBottom: '24px', lineHeight: 1.5, textAlign: 'left',
                }}>
                  <strong>🔒 Refund Details</strong><br />
                  The refund will appear in your original payment account within <strong>5–7 business days</strong>.
                  If it doesn't arrive, contact us with your order number <strong>{order.orderNumber}</strong>.
                </div>
              )}

              <button
                onClick={onClose}
                style={{
                  background: '#080808', color: '#fff', border: 'none',
                  borderRadius: '10px', padding: '13px 32px', fontSize: '0.95rem',
                  fontWeight: 600, cursor: 'pointer', width: '100%',
                }}
              >
                Done
              </button>
            </>
          ) : (
            /* ── CONFIRM STATE ── */
            <>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '68px', height: '68px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#fee2e2,#fecaca)',
                marginBottom: '20px',
                boxShadow: '0 6px 20px rgba(220,38,38,0.15)',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#dc2626" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
              </div>

              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
                Cancel this order?
              </h3>

              <div style={{
                background: '#f9fafb', borderRadius: '10px', padding: '12px 16px',
                margin: '12px 0 16px', fontSize: '0.85rem', color: '#374151', textAlign: 'left',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{order.orderNumber}</div>
                <div style={{ color: '#6b7280' }}>₹{Number(order.totalAmount).toLocaleString()} · {order.items?.length} item(s)</div>
              </div>

              {/* Refund notice for prepaid orders */}
              {isPaid ? (
                <div style={{
                  background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: '10px',
                  padding: '12px 14px', fontSize: '0.82rem', color: '#5b21b6',
                  marginBottom: '22px', lineHeight: 1.5, textAlign: 'left',
                }}>
                  💸 <strong>Prepaid order</strong> — your payment of <strong>₹{Number(order.totalAmount).toLocaleString()}</strong> will be refunded to your original account in <strong>5–7 business days</strong>.
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '22px' }}>
                  This is a Cash on Delivery order — no payment will be processed.
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: '12px', border: '1.5px solid #d1d5db',
                    borderRadius: '10px', background: '#fff', fontWeight: 600,
                    cursor: 'pointer', fontSize: '0.92rem', color: '#374151',
                  }}
                >
                  Keep Order
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={cancelling}
                  style={{
                    flex: 1, padding: '12px', border: 'none',
                    borderRadius: '10px', background: '#dc2626', color: '#fff',
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem',
                    opacity: cancelling ? 0.7 : 1,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cancelSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────── */
const MyOrders = () => {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null); // order being cancelled

  const loadOrders = () => {
    orderApi.getOrders()
      .then(res => setOrders(res.data))
      .catch(err => console.error('Failed to load orders', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
        <div className="container py-5 mt-5 text-center flex-grow-1">
          <div className="spinner-border mb-3" style={{ width: '2.5rem', height: '2.5rem' }} role="status" />
          <p className="text-muted">Loading your orders…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
        <div className="container py-5 mt-4 flex-grow-1 text-center">
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📦</div>
          <h1 className="font-serif fw-bold mb-3">No Orders Yet</h1>
          <p className="text-muted fs-5 mb-4">You haven't placed any orders yet.</p>
          <Link to="/catalog" className="btn btn-solid rounded-pill px-4">Start Shopping</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1" style={{ maxWidth: '860px' }}>

        {/* Header */}
        <div className="mb-5 pb-2">
          <Link to="/profile" className="text-dark text-decoration-none d-inline-flex align-items-center fs-5 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" className="me-2">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back to profile
          </Link>
          <h1 className="font-serif fw-bold mb-1" style={{ fontSize: '3.5rem', letterSpacing: '-1px' }}>My Orders</h1>
          <p className="text-muted fs-5">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
        </div>

        {/* Order cards */}
        {orders.map(order => {
          const isFailed     = order.orderStatus === 'PAYMENT_FAILED';
          const isCancelled  = order.orderStatus === 'CANCELLED';
          const canCancel    = CANCELLABLE.has(order.orderStatus);

          const cardBorder = (isFailed || isCancelled) ? '2px solid #fca5a5' : '2px solid transparent';
          const cardBg     = (isFailed || isCancelled) ? '#fffafa' : '#eef1f3';

          return (
            <div key={order.id} className="mb-4" style={{
              borderRadius: '16px', overflow: 'hidden',
              border: cardBorder, background: cardBg,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>

              {/* Payment-failed banner */}
              {isFailed && (
                <div style={{ background: '#dc2626', color: '#fff', padding: '8px 20px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>⚠</span> Payment failed — no money deducted. You can retry from the cart.
                </div>
              )}

              {/* Cancelled banner */}
              {isCancelled && (
                <div style={{
                  background: '#6b7280', color: '#fff', padding: '8px 20px',
                  fontSize: '0.82rem', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center',
                }}>
                  <span>✕</span> This order has been cancelled.
                  {order.paymentStatus === 'REFUND_INITIATED' && ' A refund has been initiated — 5–7 business days.'}
                </div>
              )}

              {/* ── Card header ── */}
              <div className="p-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <div>
                    <div className="fw-bold fs-5 mb-1">{order.orderNumber || `#${order.id}`}</div>
                    <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <StatusPill status={order.orderStatus} />
                    <PaymentPill status={order.paymentStatus} method={order.paymentMethod} />
                  </div>
                </div>

                {/* Thumbnails + total */}
                <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">

                  {/* Item thumbnails */}
                  <div className="d-flex gap-2 flex-wrap">
                    {order.items?.slice(0, 4).map((item, i) => (
                      <div key={i} title={item.productName} style={{
                        width: '56px', height: '56px', borderRadius: '10px',
                        overflow: 'hidden', background: '#f3f4f6',
                        border: '1px solid #e5e7eb', flexShrink: 0,
                      }}>
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                          : <div className="d-flex align-items-center justify-content-center w-100 h-100" style={{ fontSize: '1.4rem' }}>👕</div>
                        }
                      </div>
                    ))}
                    {(order.items?.length || 0) > 4 && (
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '10px',
                        background: '#f3f4f6', border: '1px solid #e5e7eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: '#6b7280',
                      }}>
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Right side: total + actions */}
                  <div className="text-end">
                    <div className="fw-bold" style={{ fontSize: '1.4rem' }}>₹{Number(order.totalAmount).toLocaleString()}</div>
                    <div className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} · {order.paymentMethod}
                    </div>

                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                      {/* Cancel button — only before dispatch */}
                      {canCancel && (
                        <button
                          onClick={() => setCancelTarget(order)}
                          style={{
                            background: '#fef2f2', color: '#dc2626',
                            border: '1.5px solid #fca5a5', borderRadius: '8px',
                            padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* Shipped/delivered → no cancel, show why */}
                      {(order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED') && (
                        <span style={{
                          fontSize: '0.75rem', color: '#9ca3af',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          🚚 {order.orderStatus === 'SHIPPED' ? 'Cannot cancel — already shipped' : 'Delivered'}
                        </span>
                      )}

                      <Link
                        to={`/orders/${order.id}`}
                        style={{
                          background: '#080808', color: '#fff', border: 'none',
                          borderRadius: '8px', padding: '6px 16px',
                          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                          textDecoration: 'none', display: 'inline-block',
                        }}
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          );
        })}

      </div>
      <Footer />

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <CancelModal
          order={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={() => {
            loadOrders(); // refresh list silently
          }}
        />
      )}
    </div>
  );
};

export default MyOrders;
