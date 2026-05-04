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

  const fetchOrders = () => {
    setLoading(true);
    const apiStatus = filter === "All Orders" ? null : filter;
    adminApi.getOrders({ search: search || null, status: apiStatus })
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch orders", err);
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
    if (!value) {
      return "N/A";
    }
    return new Date(value).toLocaleString();
  };

  const csvCell = (value) => {
    const normalized = String(value ?? "").replace(/"/g, '""');
    return `"${normalized}"`;
  };

  const downloadOrdersExcel = () => {
    const rows = orders.map((order) => ({
      "Order #": order.orderNumber,
      "Placed Timestamp": formatTimestamp(order.createdAt),
      "Customer Name": order.customerName || "N/A",
      "Customer Email": order.customerEmail || "",
      "Payment Method": order.paymentMethod || "N/A",
      "Payment Status": order.paymentStatus || "N/A",
      Subtotal: Number(order.subtotal || 0),
      Shipping: Number(order.shippingFee || 0),
      GST: Number(order.gstAmount || 0),
      Total: Number(order.totalAmount || 0),
      "Item Count": Number(order.itemCount || 0),
      "Order Items": order.itemDetails || "",
      "Delivery Address": order.deliveryAddress || "",
      "Delivery Phone": order.deliveryPhone || "",
      Status: order.status || "",
    }));

    const headers = [
      "Order #",
      "Placed Timestamp",
      "Customer Name",
      "Customer Email",
      "Payment Method",
      "Payment Status",
      "Subtotal",
      "Shipping",
      "GST",
      "Total",
      "Item Count",
      "Order Items",
      "Delivery Address",
      "Delivery Phone",
      "Status",
    ];

    const csv = [
      headers.map(csvCell).join(","),
      ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uniformly-orders-${new Date().toISOString().slice(0, 10)}.csv`;
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
