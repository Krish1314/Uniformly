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
                  <td>{order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</td>
                  <td>
                    <strong>{order.customer}</strong>
                    <p>{order.email}</p>
                  </td>
                  <td><span className="payment-pill">{order.payment || "N/A"}</span></td>
                  <td><strong>₹{order.total?.toLocaleString()}</strong></td>
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
