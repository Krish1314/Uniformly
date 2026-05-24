import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import CancelOrderModal from '../components/CancelOrderModal';
import { orderApi } from '../api/orderApi';

/* ─── Which statuses allow cancellation (must match backend) ──────── */
const getOrderStatus = (order) => order?.status ?? order?.orderStatus ?? '';

/* ─── Status config ──────────────────────────────────────────────── */
const STATUS_CONFIG = {
  PLACED:          { label: 'Order Placed',   bg: '#f3f4f6', color: '#374151' },
  PACKED:          { label: 'Packed',         bg: '#eff6ff', color: '#1d4ed8' },
  SHIPPED:         { label: 'Shipped',        bg: '#f0fdf4', color: '#166534' },
  DELIVERED:       { label: 'Delivered',      bg: '#dcfce7', color: '#15803d' },
  CANCELLED:       { label: 'Cancelled',      bg: '#f3f4f6', color: '#6b7280' },
  PAYMENT_FAILED:  { label: 'Payment Failed', bg: '#f3f4f6', color: '#6b7280' },
};

const PAYMENT_STATUS_CONFIG = {
  PAID:             { label: 'Paid',             bg: '#d1fae5', color: '#065f46' },
  PENDING:          { label: 'Pending',          bg: '#fef3c7', color: '#92400e' },
  FAILED:           { label: 'Failed',           bg: '#fee2e2', color: '#991b1b' },
  CANCELLED:        { label: 'Cancelled',        bg: '#f3f4f6', color: '#6b7280' },
  REFUND_INITIATED: { label: 'Refund Initiated', bg: '#ede9fe', color: '#5b21b6' },
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px', borderRadius: '999px',
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.03em',
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
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
        COD
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
          const status = getOrderStatus(order);

          return (
            <div key={order.id} className="mb-4" style={{
              borderRadius: '16px', overflow: 'hidden',
              border: '2px solid transparent', background: '#eef1f3',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>



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
                    <StatusPill status={status} />
                    {status !== 'CANCELLED' && status !== 'PAYMENT_FAILED' && (
                      <PaymentPill status={order.paymentStatus} method={order.paymentMethod} />
                    )}
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
        <CancelOrderModal
          order={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={() => {
            setCancelTarget(null);
            loadOrders();
          }}
        />
      )}
    </div>
  );
};

export default MyOrders;
