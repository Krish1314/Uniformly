import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import adminApi from "../api/adminApi";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Orders");

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
      .then(() => {
        fetchOrders();
      })
      .catch((err) => console.error("Failed to update status", err));
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

    const rows = orders.map((order) => [
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
        <div className="admin-actions">
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
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <button
            className="admin-primary-btn"
            type="button"
            onClick={downloadOrdersExcel}
            disabled={loading || orders.length === 0}
          >
            Download Excel
          </button>
        </div>
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
        ) : orders.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            No orders found.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.orderNumber}</strong></td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</td>
                  <td>
                    <strong>{order.customerName || "N/A"}</strong>
                    <p>{order.customerEmail || ""}</p>
                  </td>
                  <td><span className="payment-pill">{order.paymentMethod || "N/A"}</span></td>
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
                  <td>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
