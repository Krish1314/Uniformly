import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Admin.css";

const AdminLayout = ({ title, children, actions, toolbar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!token) return;

    // Connect to SSE stream, passing the JWT as a query param
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';
    const eventSource = new EventSource(`${baseUrl}/admin/stream?token=${token}`);

    eventSource.addEventListener("order_placed", (event) => {
      const data = JSON.parse(event.data);
      const newToast = {
        id: Date.now(),
        title: "New Order Placed!",
        body: `Order #${data.orderNumber} for ₹${data.total} via ${data.paymentMethod}`
      };
      
      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    });

    eventSource.onerror = (error) => {
      console.error("SSE connection error", error);
    };

    return () => {
      eventSource.close();
    };
  }, [token]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Uniformly Admin</div>

        <nav className="admin-nav">
          <Link className={isActive("/admin") ? "active" : ""} to="/admin">
            Dashboard
          </Link>

          <Link
            className={isActive("/admin/orders") ? "active" : ""}
            to="/admin/orders"
          >
            Orders
          </Link>

          <Link
            className={isActive("/admin/products") ? "active" : ""}
            to="/admin/products"
          >
            Products
          </Link>
          
          <Link
            className={isActive("/admin/size-guides") ? "active" : ""}
            to="/admin/size-guides"
          >
            Size Guides
          </Link>

          <Link
            className={isActive("/admin/schools") ? "active" : ""}
            to="/admin/schools"
          >
            Schools
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <Link className="back-store" to="/">
            ← Back to Store
          </Link>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>{title}</h1>
          {actions ? <div className="admin-header-actions">{actions}</div> : null}
        </div>

        {toolbar ? <div className="admin-toolbar">{toolbar}</div> : null}

        {children}
      </main>

      {/* SSE Toast Container */}
      <div className="admin-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="admin-toast">
            <div className="admin-toast-title">{toast.title}</div>
            <div className="admin-toast-body">{toast.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLayout;

