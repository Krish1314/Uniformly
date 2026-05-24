import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';

const FALLBACK_REASONS = [
  { code: 'ORDERED_BY_MISTAKE', label: 'Ordered by mistake' },
  { code: 'FOUND_CHEAPER', label: 'Found a better price elsewhere' },
  { code: 'DELIVERY_TOO_LATE', label: 'Delivery is too late' },
  { code: 'WRONG_SIZE_COLOR', label: 'Wrong size or colour' },
  { code: 'CHANGED_MIND', label: 'Changed my mind' },
  { code: 'OTHER', label: 'Other reason' },
];

/**
 * Myntra-style cancel flow: pick reason → confirm → success
 */
const CancelOrderModal = ({ order, onClose, onCancelled }) => {
  const [step, setStep] = useState('reason'); // reason | confirm | done
  const [reasons, setReasons] = useState(FALLBACK_REASONS);
  const [selectedReason, setSelectedReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult] = useState(null);

  const isPaid = order.paymentStatus === 'PAID';
  const isCod = order.paymentMethod === 'COD';
  const isPendingPayment = order.paymentStatus === 'PENDING' && !isCod;

  useEffect(() => {
    orderApi.getCancellationReasons()
      .then((res) => {
        if (res.data?.length) setReasons(res.data);
      })
      .catch(() => {});
  }, []);

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await orderApi.cancelOrder(order.id, selectedReason);
      setResult(res.data);
      setStep('done');
      onCancelled?.(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not cancel order. Please contact support.';
      alert(msg);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={step === 'done' ? onClose : undefined}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(8,8,8,0.55)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
          animation: 'cancelSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        <div
          style={{
            height: '5px',
            background:
              step === 'done'
                ? result?.refundInitiated
                  ? 'linear-gradient(90deg,#7c3aed,#a78bfa)'
                  : 'linear-gradient(90deg,#16a34a,#4ade80)'
                : 'linear-gradient(90deg,#dc2626,#f87171)',
            flexShrink: 0,
          }}
        />

        <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
          {step === 'reason' && (
            <>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  marginBottom: '6px',
                }}
              >
                Why are you cancelling?
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '18px' }}>
                Order <strong>{order.orderNumber}</strong> · ₹{Number(order.totalAmount).toLocaleString()}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {reasons.map((r) => (
                  <label
                    key={r.code}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border:
                        selectedReason === r.code
                          ? '2px solid #111'
                          : '1px solid #e5e7eb',
                      background: selectedReason === r.code ? '#f9fafb' : '#fff',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: selectedReason === r.code ? 600 : 400,
                    }}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={r.code}
                      checked={selectedReason === r.code}
                      onChange={() => setSelectedReason(r.code)}
                      style={{ accentColor: '#111' }}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '10px',
                    background: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={!selectedReason}
                  onClick={() => setStep('confirm')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '10px',
                    background: selectedReason ? '#111' : '#9ca3af',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: selectedReason ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  marginBottom: '12px',
                  textAlign: 'center',
                }}
              >
                Confirm cancellation
              </h3>
              <div
                style={{
                  background: '#f9fafb',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '14px',
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ color: '#6b7280', marginBottom: '4px' }}>Reason</div>
                <div style={{ fontWeight: 600 }}>
                  {reasons.find((r) => r.code === selectedReason)?.label}
                </div>
              </div>
              {isPaid && (
                <div
                  style={{
                    background: '#f5f3ff',
                    border: '1px solid #c4b5fd',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '0.82rem',
                    color: '#5b21b6',
                    marginBottom: '14px',
                    lineHeight: 1.5,
                  }}
                >
                  💸 Refund of <strong>₹{Number(order.totalAmount).toLocaleString()}</strong> will be
                  initiated to your original payment method within <strong>5–7 business days</strong>.
                </div>
              )}
              {isCod && (
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '14px' }}>
                  Cash on Delivery — no payment was collected. Your order will be cancelled immediately.
                </p>
              )}
              {isPendingPayment && (
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '14px' }}>
                  Payment was not completed — this order will be cancelled with no charge.
                </p>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setStep('reason')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '10px',
                    background: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '10px',
                    background: '#dc2626',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: cancelling ? 'not-allowed' : 'pointer',
                    opacity: cancelling ? 0.7 : 1,
                  }}
                >
                  {cancelling ? 'Cancelling…' : 'Cancel Order'}
                </button>
              </div>
            </>
          )}

          {step === 'done' && result && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                {result.refundInitiated ? '💸' : '✅'}
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                Order Cancelled
              </h3>
              <p style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {result.message}
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#080808',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px 32px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes cancelSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CancelOrderModal;
