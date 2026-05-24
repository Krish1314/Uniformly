import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import CancelOrderModal from '../components/CancelOrderModal';
import { orderApi } from '../api/orderApi';

/* ─── Constants ──────────────────────────────────────────────────── */
const CANCELLABLE = new Set(['PLACED', 'PACKED']);

/** API returns `status`; keep fallback for older clients */
const getOrderStatus = (order) => order?.status ?? order?.orderStatus ?? '';

const ORDER_STATUS = {
  PLACED:          { label: 'Order Placed',   color: '#374151', bg: '#f3f4f6', icon: '📋' },
  PACKED:          { label: 'Packed',         color: '#1d4ed8', bg: '#eff6ff', icon: '📦' },
  SHIPPED:         { label: 'Shipped',        color: '#166534', bg: '#f0fdf4', icon: '🚚' },
  DELIVERED:       { label: 'Delivered',      color: '#15803d', bg: '#dcfce7', icon: '✅' },
  CANCELLED:       { label: 'Cancelled',      color: '#b91c1c', bg: '#fef2f2', icon: '✕'  },
  PAYMENT_FAILED:  { label: 'Payment Failed', color: '#b91c1c', bg: '#fef2f2', icon: '⚠'  },
};

const PAYMENT_STATUS = {
  PAID:             { label: 'Paid',             color: '#065f46', bg: '#d1fae5' },
  PENDING:          { label: 'Pending',          color: '#92400e', bg: '#fef3c7' },
  FAILED:           { label: 'Failed',           color: '#991b1b', bg: '#fee2e2' },
  CANCELLED:        { label: 'Cancelled',        color: '#6b7280', bg: '#f3f4f6' },
  REFUND_INITIATED: { label: 'Refund Initiated', color: '#5b21b6', bg: '#ede9fe' },
};

/* ─── Timeline steps ─────────────────────────────────────────────── */
const STEPS = [
  { key: 'PLACED',    label: 'Order Placed',   icon: '📋' },
  { key: 'PACKED',    label: 'Packed',         icon: '📦' },
  { key: 'SHIPPED',   label: 'Shipped',        icon: '🚚' },
  { key: 'DELIVERED', label: 'Delivered',      icon: '🏠' },
];

/* ─── Pill components ────────────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const cfg = ORDER_STATUS[status] || { label: status, color: '#374151', bg: '#f3f4f6', icon: '' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '5px 14px', borderRadius: '999px',
      fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.03em',
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const PaymentPill = ({ status, method }) => {
  if (method === 'COD' && status === 'PENDING') {
    return <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#f3f4f6', color: '#374151' }}>💵 Cash on Delivery</span>;
  }
  const cfg = PAYMENT_STATUS[status] || { label: status, color: '#374151', bg: '#f3f4f6' };
  return <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
const OrderDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const [order,       setOrder]       = useState(null);
  const [tracking,    setTracking]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showCancel,  setShowCancel]  = useState(false);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const response = await orderApi.downloadInvoice(order.id);
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

  const loadOrder = () => {
    Promise.all([
      orderApi.getOrderById(id),
      orderApi.getTracking(id),
    ])
      .then(([orderRes, trackRes]) => {
        setOrder(orderRes.data);
        setTracking(trackRes.data);
      })
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrder(); }, [id]);

  /* After cancel — refresh order data and close modal */
  const handleCancelled = () => {
    loadOrder();
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
        <div className="container py-5 mt-5 text-center flex-grow-1">
          <div className="spinner-border mb-3" style={{ width: '2.5rem', height: '2.5rem' }} role="status" />
          <p className="text-muted">Loading order…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  const status        = getOrderStatus(order);
  const canCancel     = order.canCancel ?? CANCELLABLE.has(status);
  const isCancelled   = status === 'CANCELLED';
  const isDelivered   = status === 'DELIVERED';
  const isShipped     = status === 'SHIPPED';
  const isFailed      = status === 'PAYMENT_FAILED' || order.paymentStatus === 'FAILED';

  const timelineSteps = isFailed
    ? [
        { key: 'PAYMENT',   label: 'Payment Failed', icon: '❌' },
        { key: 'CONFIRM',   label: 'Order Confirmed',icon: '📋' },
        { key: 'SHIPPED',   label: 'Shipped',        icon: '🚚' },
        { key: 'DELIVERED', label: 'Delivered',      icon: '🏠' },
      ]
    : isCancelled
      ? [
          { key: 'PLACED',    label: 'Order Placed',   icon: '📋' },
          { key: 'CANCELLED', label: 'Cancelled',      icon: '❌' },
        ]
      : STEPS;

  /* ── Accent colour by status ── */
  const accentColor = isDelivered ? '#16a34a' : isShipped ? '#2563eb' : isCancelled || isFailed ? '#dc2626' : '#080808';

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1" style={{ maxWidth: '820px' }}>

        {/* ── Back link ── */}
        <Link to="/orders" className="text-dark text-decoration-none d-inline-flex align-items-center gap-2 mb-4 fs-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          All Orders
        </Link>

        {/* ── Hero header ── */}
        <div style={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: '24px',
        }}>
          {/* Top accent bar */}
          <div style={{ height: '6px', background: accentColor }} />

          <div className="p-4 pb-3">
            {/* Order number + date */}
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Order</div>
                <h1 className="font-serif fw-bold mb-1" style={{ fontSize: '2rem', letterSpacing: '-0.5px' }}>
                  {order.orderNumber}
                </h1>
                <div style={{ fontSize: '0.83rem', color: '#6b7280' }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="d-flex flex-column align-items-end gap-2">
                <StatusPill status={isFailed ? 'PAYMENT_FAILED' : status} />
                <PaymentPill status={order.paymentStatus} method={order.paymentMethod} />
              </div>
            </div>

            {/* ── Action bar ── */}
            <div className="d-flex gap-2 flex-wrap pt-2 border-top" style={{ borderColor: '#f3f4f6' }}>
              {!isFailed && (
                <button
                  onClick={handleDownloadInvoice}
                  disabled={downloading}
                  style={{
                    background: '#f3f4f6', color: '#1f2937', border: '1.5px solid #d1d5db',
                    borderRadius: '8px', padding: '8px 18px', fontSize: '0.85rem',
                    fontWeight: 600, cursor: downloading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {downloading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />
                      Downloading...
                    </>
                  ) : (
                    <>📄 Download Invoice</>
                  )}
                </button>
              )}
              {(isShipped || isDelivered) && (
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🚚 {isShipped ? 'Cannot cancel — order is on its way' : 'Order delivered'}
                </span>
              )}


            </div>
          </div>
        </div>

        {/* ── Cancelled notice ── */}
        {isCancelled && order.cancellationReason && (
          <div style={{
            background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '14px',
            padding: '16px 20px', marginBottom: '24px', fontSize: '0.88rem', color: '#991b1b',
          }}>
            <strong>Cancelled</strong> — {order.cancellationReason}
            {order.cancelledAt && (
              <span style={{ color: '#b91c1c', marginLeft: '8px' }}>
                ({new Date(order.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})
              </span>
            )}
          </div>
        )}

        {/* ── Refund notice banner ── */}
        {order.paymentStatus === 'REFUND_INITIATED' && (
          <div style={{
            background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: '14px',
            padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💸</span>
            <div>
              <div style={{ fontWeight: 700, color: '#5b21b6', marginBottom: '4px' }}>Refund in Progress</div>
              <div style={{ fontSize: '0.85rem', color: '#7c3aed', lineHeight: 1.5 }}>
                Your refund of <strong>₹{Number(order.totalAmount).toLocaleString()}</strong> has been initiated and will credit to your original payment account within <strong>5–7 business days</strong>. Keep your order number <strong>{order.orderNumber}</strong> handy for reference.
              </div>
            </div>
          </div>
        )}

        {/* ── Payment Failed warning banner ── */}
        {isFailed && (
          <div style={{
            background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '14px',
            padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center',
          }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: '2px' }}>Payment Failed</div>
              <div style={{ fontSize: '0.85rem', color: '#b91c1c', lineHeight: 1.5 }}>
                Your online transaction was not completed successfully, so this order has not been placed. No funds have been debited from your account.
              </div>
            </div>
          </div>
        )}

        {/* ── Order timeline ── */}
        {((!isCancelled && !isFailed && tracking) || isCancelled || isFailed) && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px 28px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '20px' }}>
              Order Timeline
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              {timelineSteps.map((step, i) => {
                const done = isFailed
                  ? (step.key === 'PAYMENT')
                  : isCancelled
                    ? (step.key === 'PLACED' || step.key === 'CANCELLED')
                    : tracking?.history?.includes(step.key);

                const current = isFailed
                  ? step.key === 'PAYMENT'
                  : isCancelled
                    ? step.key === 'CANCELLED'
                    : tracking?.currentStatus === step.key;

                const isLast  = i === timelineSteps.length - 1;

                const bg = done
                  ? (current
                    ? (isFailed || isCancelled ? '#fee2e2' : '#080808')
                    : '#f0fdf4')
                  : '#f3f4f6';

                const border = current
                  ? (isFailed || isCancelled ? '3px solid #dc2626' : '3px solid #080808')
                  : (done ? '2px solid #16a34a' : '2px solid #e5e7eb');

                const shadow = current
                  ? (isFailed || isCancelled ? '0 0 0 4px rgba(220,38,38,0.15)' : '0 0 0 4px rgba(8,8,8,0.1)')
                  : 'none';

                const iconColor = done && !current
                  ? '#16a34a'
                  : (current && (isFailed || isCancelled) ? '#dc2626' : undefined);

                return (
                  <React.Fragment key={step.key}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '64px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem',
                        background: bg,
                        border: border,
                        boxShadow: shadow,
                        transition: 'all 0.3s',
                        color: iconColor,
                      }}>
                        {done ? (current ? step.icon : '✓') : step.icon}
                      </div>
                      <div style={{
                        marginTop: '8px', fontSize: '0.7rem',
                        fontWeight: current ? 700 : 500,
                        color: current
                          ? (isFailed || isCancelled ? '#dc2626' : '#111')
                          : (done ? '#374151' : '#9ca3af'),
                        textAlign: 'center', maxWidth: '64px', lineHeight: 1.2,
                      }}>
                        {step.label}
                      </div>
                    </div>
                    {!isLast && (
                      <div style={{
                        flex: 1, height: '2px',
                        background: isFailed
                          ? '#e5e7eb'
                          : isCancelled
                            ? '#dc2626'
                            : (done ? '#16a34a' : '#e5e7eb'),
                        margin: '0 4px', marginBottom: '20px',
                        transition: 'background 0.3s'
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Two-column info ── */}
        <div className="row g-3 mb-3">
          {/* Delivery address */}
          <div className="col-md-6">
            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '14px' }}>
                📍 Delivery Address
              </div>
              {order.address ? (
                <>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>{order.address.fullName}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    {order.address.addressLine}<br />
                    {order.address.city}, {order.address.state} – {order.address.pincode}<br />
                    📞 {order.address.phone}
                  </div>
                </>
              ) : (
                <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Address not available</div>
              )}
            </div>
          </div>

          {/* Payment summary */}
          <div className="col-md-6">
            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', marginBottom: '14px' }}>
                💳 Payment Summary
              </div>
              {[
                ['Method',   order.paymentMethod],
                ['Subtotal', `₹${Number(order.subtotal).toLocaleString()}`],
                ['Shipping', `₹${Number(order.shippingFee).toLocaleString()}`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#6b7280', marginBottom: '8px' }}>
                  <span>{label}</span><span style={{ fontWeight: 600, color: '#111' }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, paddingTop: '10px', borderTop: '1px solid #f3f4f6', marginTop: '4px' }}>
                <span>{order.paymentStatus === 'PAID' ? 'Total Paid' : isCancelled ? 'Total (cancelled)' : 'Total'}</span>
                <span>₹{Number(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Item list ── */}
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
            <span>📦 Items Ordered</span>
            <span>{order.items?.length} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
          </div>

          {order.items?.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
              borderBottom: i < order.items.length - 1 ? '1px solid #f9fafb' : 'none',
              background: i % 2 === 0 ? '#fff' : '#fafafa',
            }}>
              {/* Image */}
              <div style={{ width: '68px', height: '68px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden', background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>👕</div>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{item.productName}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '3px' }}>{item.schoolName}</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f3f4f6', padding: '2px 8px', borderRadius: '6px', color: '#374151' }}>Size: {item.size}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f3f4f6', padding: '2px 8px', borderRadius: '6px', color: '#374151' }}>{item.color}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Qty: {item.quantity}</span>
                </div>
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>₹{Number(item.totalPrice).toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>₹{Number(item.unitPrice).toLocaleString()} each</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Actions footer ── */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          borderRadius: '14px',
          background: '#fff',
          border: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '0.88rem', color: '#6b7280' }}>
            {isCancelled && (
              <span style={{ color: '#b91c1c', fontWeight: 600 }}>This order has been cancelled.</span>
            )}
            {canCancel && (
              <span>You can cancel this order before it is shipped.</span>
            )}
            {(isShipped || isDelivered) && !isCancelled && (
              <span>This order can no longer be cancelled.</span>
            )}
            {isFailed && (
              <span>Payment failed — this order was not placed.</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {canCancel && (
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 22px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Cancel Order
              </button>
            )}
            <Link
              to="/orders"
              style={{
                background: '#080808',
                color: '#fff',
                borderRadius: '8px',
                padding: '10px 22px',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              ← All Orders
            </Link>
          </div>
        </div>

      </div>
      <Footer />

      {/* Cancel Modal */}
      {showCancel && (
        <CancelOrderModal
          order={order}
          onClose={() => setShowCancel(false)}
          onCancelled={handleCancelled}
        />
      )}
    </div>
  );
};

export default OrderDetail;
