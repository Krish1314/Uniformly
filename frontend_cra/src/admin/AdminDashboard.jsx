import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import adminApi from "../api/adminApi";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard error", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          Loading admin metrics...
        </div>
      </AdminLayout>
    );
  }

  const salesArray = data ? Object.entries(data.dailySales) : [];
  const maxSales = Math.max(...salesArray.map(([_, sales]) => sales), 1000);

  return (
    <AdminLayout title="Dashboard">
      {data?.lowStockProducts > 0 && (
        <div className="admin-alert">
          ⚠️ <strong>{data.lowStockProducts} products</strong> are low on stock and need attention.
          <a href="/admin/products" style={{ color: "inherit", marginLeft: "10px", fontWeight: "bold" }}>View Inventory ↗</a>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{data?.totalRevenue?.toLocaleString() || 0}</div>
          <div className="stat-meta">Lifetime Earnings</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{data?.totalOrders || 0}</div>
          <div className="stat-meta">Placed through platform</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value">{data?.pendingOrders || 0}</div>
          <div className="stat-meta dark">Needs fulfillment</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Products</div>
          <div className="stat-value">{data?.totalProducts || 0}</div>
          <div className="stat-meta">{data?.lowStockProducts || 0} low in stock</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="admin-card sales-card">
          <h3>Sales Overview (Last 14 Days)</h3>

          <div className="chart" style={{ height: "250px", position: "relative", marginTop: "30px", borderBottom: "1px solid #e5e7eb" }}>
            <div className="chart-line" style={{ position: "absolute", left: 0, right: 0, borderTop: "1px dashed #e5e7eb", bottom: "100%" }}>
              <span style={{ fontSize: "11px", color: "#6b7280", position: "absolute", left: "-60px", top: "-8px" }}>₹{Math.round(maxSales)}</span>
            </div>
            <div className="chart-line" style={{ position: "absolute", left: 0, right: 0, borderTop: "1px dashed #e5e7eb", bottom: "50%" }}>
              <span style={{ fontSize: "11px", color: "#6b7280", position: "absolute", left: "-60px", top: "-8px" }}>₹{Math.round(maxSales * 0.5)}</span>
            </div>
            <div className="chart-line" style={{ position: "absolute", left: 0, right: 0, borderTop: "1px dashed #e5e7eb", bottom: "0%" }}>
              <span style={{ fontSize: "11px", color: "#6b7280", position: "absolute", left: "-60px", top: "-8px" }}>₹0</span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", height: "100%", justifyContent: "space-between", paddingLeft: "10px", paddingRight: "10px" }}>
              {salesArray.map(([date, sales], index) => {
                const heightPercent = (sales / maxSales) * 100;
                return (
                  <div
                    key={date}
                    style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative" }}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {hoveredBar === index && (
                      <div className="tooltip-card" style={{ position: "absolute", bottom: `${heightPercent + 5}%`, left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "white", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                        <strong>{date}</strong><br />
                        ₹{sales.toLocaleString()}
                      </div>
                    )}
                    <div
                      style={{
                        width: "60%",
                        height: `${heightPercent}%`,
                        background: hoveredBar === index ? "#2563eb" : "#101827",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.2s ease",
                        minHeight: sales > 0 ? "4px" : "0px"
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="chart-dates" style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "11px", color: "#6b7280" }}>
              {salesArray.map(([date]) => (
                <span key={date} style={{ flex: 1, textAlign: "center" }}>{date}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-card">
          <h3>Order Status</h3>
          {data?.orderStatusCounts && Object.keys(data.orderStatusCounts).length === 0 ? (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>No order metrics recorded.</p>
          ) : (
            Object.entries(data?.orderStatusCounts || {}).map(([status, count]) => {
              const percent = (count / (data.totalOrders || 1)) * 100;
              return (
                <div className="status-row" key={status}>
                  <span>{status}</span>
                  <div className="status-bar"><div style={{ width: `${percent}%`, background: "#2563eb" }} /></div>
                  <strong>{count}</strong>
                </div>
              );
            })
          )}
        </section>
      </div>

      <div className="bottom-grid">
        <section className="admin-card">
          <div className="card-title-row">
            <h3>Recent Orders</h3>
            <a href="/admin/orders">View all</a>
          </div>

          {data?.recentOrders?.length === 0 ? (
            <p style={{ color: "#6b7280", padding: "10px" }}>No orders placed yet.</p>
          ) : (
            data?.recentOrders?.map((order) => (
              <div className="recent-order" key={order.id}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <p>{order.customerName}</p>
                </div>
                <div>
                  <strong>₹{order.totalAmount?.toLocaleString()}</strong>
                  <p>{order.status}</p>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="admin-card">
          <h3>Top Products</h3>

          {data?.topProducts?.length === 0 ? (
            <p style={{ color: "#6b7280", padding: "10px" }}>No product sales recorded yet.</p>
          ) : (
            data?.topProducts?.map((item) => (
              <div className="top-product" key={item.productId}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} style={{ width: "38px", height: "38px", objectFit: "cover", borderRadius: "4px" }} />
                ) : (
                  <div className="admin-thumb"></div>
                )}
                <div style={{ flex: 1, marginLeft: "12px" }}>
                  <strong>{item.name}</strong>
                  <p>{item.unitsSold} units sold</p>
                </div>
                <strong>₹{item.revenue?.toLocaleString()}</strong>
              </div>
            ))
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
