import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { orderApi } from '../api/orderApi';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await orderApi.getOrders();
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (loading) {
    return <div className="container py-5 mt-5 text-center">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
        <div className="container py-5 mt-4 flex-grow-1 text-center">
          <h1 className="font-serif fw-bold mb-3">No Orders Yet</h1>
          <p className="text-muted fs-5 mb-4">You have not placed any orders yet.</p>
          <Link to="/catalog" className="btn btn-solid rounded-pill px-4">Start Shopping</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div className="mb-5 pb-3">
          <Link to="/profile" className="text-dark text-decoration-none d-inline-flex align-items-center fs-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-arrow-left me-3 fw-bold" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back to profile
          </Link>
          <h1 className="font-serif fw-bold mb-2" style={{ fontSize: '4rem', letterSpacing: '-1px' }}>My Orders</h1>
          <p className="text-muted fs-4">All your Uniformly purchases in one place</p>
        </div>

        {/* Order Cards */}
        {orders.map(order => (
          <div className="info-block p-4 mb-4 position-relative" key={order.id}>
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-box text-muted me-3" viewBox="0 0 16 16">
                  <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                </svg>
                <span className="fw-bold fs-4 me-3 text-secondary">{order.orderNumber || `UNF-${order.id}`}</span>
                <span className="status-pill text-dark shadow-sm">{order.status.toLowerCase()}</span>
              </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-end">
              <div>
                <div className="text-muted mb-3 fs-6">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div className="bg-white p-2 rounded border" style={{ width: '80px', height: '80px' }}>
                  <img src={order.items && order.items[0] ? order.items[0].imageUrl || order.items[0].image || "/images/sweater.jpg" : "/images/sweater.jpg"} alt="Item thumbnail" className="w-100 h-100 object-fit-cover" />
                </div>
              </div>
              
              <div className="text-end">
                <div className="fw-bold fs-3 mb-1">₹ {order.totalAmount}</div>
                <div className="text-muted fs-5 mb-4 pb-2">{order.items?.length || 0} item(s)</div>
                <Link to={`/orders/${order.id}`} className="text-dark text-decoration-none fw-bold fs-5 d-flex align-items-center justify-content-end">
                  View details
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-right ms-2" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}

      </div>
      <Footer />
    </div>
  );
};

export default MyOrders;
