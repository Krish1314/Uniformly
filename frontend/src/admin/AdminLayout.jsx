import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Admin.css";

const AdminLayout = ({ title, children, actions }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Uniformly Admin</div>

        <nav className="admin-nav">
          <Link className={isActive("/admin") ? "active" : ""} to="/admin">
            <span>▦</span> Dashboard
          </Link>

          <Link
            className={isActive("/admin/orders") ? "active" : ""}
            to="/admin/orders"
          >
            <span>🛒</span> Orders
          </Link>

          <Link
            className={isActive("/admin/products") ? "active" : ""}
            to="/admin/products"
          >
            <span>⬡</span> Products
          </Link>
          
          <Link
            className={isActive("/admin/size-guides") ? "active" : ""}
            to="/admin/size-guides"
          >
            <span>📏</span> Size Guides
          </Link>
        </nav>

        <Link className="back-store" to="/">
          ← Back to Store
        </Link>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>{title}</h1>
          <div>{actions}</div>
        </div>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
