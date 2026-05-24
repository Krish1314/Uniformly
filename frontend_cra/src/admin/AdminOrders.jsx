import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import adminApi from "../api/adminApi";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Orders");

  /* ─── New filter states ──────────────────────────────────────────── */
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("All Methods");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All Payment Statuses");
  const [selectedDateRange, setSelectedDateRange] = useState("All Time");

  const statuses = ["PLACED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

  useEffect(() => {
    fetchOrders();
  }, [search, filter]);

  const [error, setError] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    const apiStatus = filter === "All Orders" ? null : filter;
    adminApi.getOrders({ search: search || null, status: apiStatus })
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch orders", err);
        setError("Failed to load orders. Please check if the server is running.");
        setLoading(false);
      });
  };

  const updateStatus = (id, status) => {
    adminApi.updateOrderStatus(id, status)
      .then(() => fetchOrders())
      .catch((err) => console.error('Failed to update status', err));
  };

  const confirmPayment = (id) => {
    if (!window.confirm('Mark this order as PAID? This cannot be undone.')) return;
    adminApi.confirmOrderPayment(id)
      .then(() => fetchOrders())
      .catch((err) => console.error('Failed to confirm payment', err));
  };

  const downloadAdminInvoice = async (id, orderNumber) => {
    try {
      const response = await adminApi.downloadInvoice(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download invoice', err);
      alert('Could not download invoice. Please try again.');
    }
  };

  const formatTimestamp = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return date.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const csvCell = (value) => {
    if (value === null || value === undefined) return '""';
    const normalized = String(value).replace(/"/g, '""');
    return `"${normalized}"`;
  };

  /* ─── Client-side filtering ──────────────────────────────────────── */
  const filteredOrders = orders.filter(order => {
    // 1. Payment Method
    if (selectedPaymentMethod !== "All Methods") {
      if (selectedPaymentMethod === "COD" && order.paymentMethod !== "COD") return false;
      if (selectedPaymentMethod === "ONLINE" && order.paymentMethod === "COD") return false;
    }
    // 2. Payment Status
    if (selectedPaymentStatus !== "All Payment Statuses") {
      const status = order.paymentStatus || "PENDING";
      if (status !== selectedPaymentStatus) return false;
    }
    // 3. Date Range
    if (selectedDateRange !== "All Time") {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (selectedDateRange === "Today" && orderDate < todayStart) return false;
      if (selectedDateRange === "Yesterday") {
        const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
        if (orderDate < yesterdayStart || orderDate >= todayStart) return false;
      }
      if (selectedDateRange === "Last 7 Days" && orderDate < new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)) return false;
      if (selectedDateRange === "Last 30 Days" && orderDate < new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000)) return false;
    }
    return true;
  });

  const hasActiveOrderFilters =
    search.trim() !== "" ||
    filter !== "All Orders" ||
    selectedPaymentMethod !== "All Methods" ||
    selectedPaymentStatus !== "All Payment Statuses" ||
    selectedDateRange !== "All Time";

  const activeFilterCount = [
    search.trim() !== "",
    selectedPaymentMethod !== "All Methods",
    selectedPaymentStatus !== "All Payment Statuses",
    selectedDateRange !== "All Time",
    filter !== "All Orders",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearch("");
    setSelectedPaymentMethod("All Methods");
    setSelectedPaymentStatus("All Payment Statuses");
    setSelectedDateRange("All Time");
    setFilter("All Orders");
  };

  const downloadOrdersExcel = () => {
    const headers = [
      "Order Number",
      "Order Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Subtotal (₹)",
      "Shipping (₹)",
      "GST (₹)",
      "Total Amount (₹)",
      "Items Count",
      "Items Details",
      "Delivery Address"
    ];

    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      formatTimestamp(order.createdAt),
      order.customerName || "N/A",
      order.customerEmail || "N/A",
      order.deliveryPhone || "N/A",
      order.paymentMethod || "N/A",
      order.paymentStatus || "N/A",
      order.status || "N/A",
      order.subtotal || 0,
      order.shippingFee || 0,
      order.gstAmount || 0,
      order.totalAmount || 0,
      order.itemCount || 0,
      order.itemDetails || "",
      order.deliveryAddress || ""
    ]);

    const csvContent = [
      headers.map(csvCell).join(","),
      ...rows.map(row => row.map(csvCell).join(","))
    ].join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uniformly-orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="Orders"
      actions={
        <button
          type="button"
          className="admin-primary-btn"
          onClick={downloadOrdersExcel}
          disabled={loading || filteredOrders.length === 0}
        >
          Download Excel
        </button>
      }
      toolbar={
        <>
          <input
            className="admin-search"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="admin-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All Orders</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="admin-select"
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          >
            <option value="All Methods">All Methods</option>
            <option value="COD">COD</option>
            <option value="ONLINE">Online</option>
          </select>
          <select
            className="admin-select"
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
          >
            <option value="All Payment Statuses">All Pay Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <select
            className="admin-select"
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
          >
            <option value="All Time">All Time</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>
          <button
            type="button"
            className="admin-reset-btn"
            onClick={clearAllFilters}
            disabled={!hasActiveOrderFilters}
            title="Reset all filters"
          >
            Reset filters
          </button>
        </>
      }
    >
      <div className="table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading orders...
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            {orders.length === 0 ? "No orders found." : (
              <div>
                <p style={{ margin: '0 0 8px', fontWeight: 600 }}>No orders match your filters.</p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {activeFilterCount > 0 && (
              <div style={{
                padding: '10px 18px',
                background: '#f0fdf4',
                borderBottom: '1px solid #dcfce7',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span>🔍</span>
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            )}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Pay Status</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.orderNumber}</strong></td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</td>
                  <td>
                    <strong>{order.customerName || "N/A"}</strong>
                    <p>{order.customerUuid ? `ID: ${order.customerUuid.substring(0, 8)}` : ""}</p>
                    {order.status === "CANCELLED" && order.cancellationReason && (
                      <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#dc2626", fontWeight: 600 }}>
                        Reason: {order.cancellationReason}
                      </p>
                    )}
                  </td>
                  <td><span className="payment-pill">{order.paymentMethod || 'N/A'}</span></td>
                  <td>
                    {(() => {
                      const ps = order.paymentStatus || 'PENDING';
                      const isFailed = ps === 'FAILED' || order.status === 'PAYMENT_FAILED';
                      const isPaid = ps === 'PAID';
                      let bg, color;
                      if (isPaid)        { bg = '#d1fae5'; color = '#065f46'; }
                      else if (isFailed) { bg = '#fef2f2'; color = '#dc2626'; }
                      else               { bg = '#fef3c7'; color = '#92400e'; }
                      return (
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 9px',
                          borderRadius: '5px',
                          fontSize: '12px',
                          fontWeight: 800,
                          background: bg,
                          color: color,
                        }}>
                          {isFailed ? 'FAILED' : isPaid ? 'PAID' : 'PENDING'}
                        </span>
                      );
                    })()}
                  </td>
                  <td>
                    <strong>
                      ₹{Number(order.totalAmount || 0).toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <span className={`order-pill ${order.status?.toLowerCase() || ""}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="row-actions" style={{ verticalAlign: 'middle', width: '380px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start', width: '100%' }}>
                      {/* Column 1: Dropdown (Fixed width: 120px) */}
                      <div style={{ width: '120px', flexShrink: 0, textAlign: 'left' }}>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box', margin: 0 }}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      {/* Column 2: Invoice Button (Fixed width: 85px) */}
                      <div style={{ width: '85px', flexShrink: 0, textAlign: 'left' }}>
                        {order.status !== 'PAYMENT_FAILED' && (
                          <button
                            style={{
                              width: '100%',
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              borderRadius: '5px',
                              padding: '5px 10px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textAlign: 'center',
                              boxSizing: 'border-box',
                              margin: 0
                            }}
                            onClick={() => downloadAdminInvoice(order.id, order.orderNumber)}
                            title="Download Invoice PDF"
                          >
                            📄 Invoice
                          </button>
                        )}
                      </div>

                      {/* Column 3: Payment Action (Fixed width: 145px) */}
                      <div style={{ width: '145px', flexShrink: 0, textAlign: 'left' }}>
                        {(() => {
                          const isCOD = order.paymentMethod === 'COD';
                          const isPaid = order.paymentStatus === 'PAID';
                          const isFailed = order.paymentStatus === 'FAILED' || order.status === 'PAYMENT_FAILED';

                          if (isFailed) {
                            /* ── Failed: red badge + rescue ── */
                            return (
                              <button
                                style={{
                                  width: '100%',
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  borderRadius: '5px',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  boxSizing: 'border-box',
                                  margin: 0,
                                  transition: 'all 0.15s',
                                }}
                                onClick={() => confirmPayment(order.id)}
                                title="Override failed payment — mark as manually received"
                              >
                                ✕ Failed
                              </button>
                            );
                          }

                          if (isCOD) {
                            if (isPaid) {
                              /* ── COD paid: amber badge ── */
                              return (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  width: '100%', justifyContent: 'center',
                                  padding: '5px 10px', borderRadius: '5px',
                                  fontSize: '12px', fontWeight: 700, boxSizing: 'border-box',
                                  background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
                                }}>
                                  💵 COD ✓
                                </span>
                              );
                            }
                            /* ── COD pending: amber confirm button ── */
                            return (
                              <button
                                style={{
                                  width: '100%',
                                  background: '#92400e',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '5px',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  boxSizing: 'border-box',
                                  margin: 0,
                                  transition: 'all 0.15s',
                                }}
                                onClick={() => confirmPayment(order.id)}
                                title="Confirm cash-on-delivery payment received"
                              >
                                💵 COD Confirm
                              </button>
                            );
                          }

                          /* ── Online / Prepaid ── */
                          const txnId = order.transactionId;
                          return (
                            <span
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                width: '100%', justifyContent: 'center',
                                padding: '5px 10px', borderRadius: '5px',
                                fontSize: '12px', fontWeight: 700, boxSizing: 'border-box',
                                background: isPaid ? '#d1fae5' : '#eff6ff',
                                color: isPaid ? '#065f46' : '#1d4ed8',
                                border: isPaid ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                                cursor: txnId ? 'help' : 'default',
                              }}
                              title={txnId ? `Transaction ID: ${txnId}` : (isPaid ? 'Prepaid — no txn ID recorded' : 'Awaiting payment gateway confirmation')}
                            >
                              {isPaid ? '✓ Prepaid' : '⏳ Prepaid'}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
