import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { orderApi } from '../api/orderApi';

const Orders = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const response = await orderApi.getOrderById(id);
        setOrder(response.data);
      } catch (err) {
        console.error("Failed to load order details", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  if (loading) {
    return <div className="container py-5 mt-5 text-center">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h2>Order Not Found</h2>
      </div>
    );
  }

  const shippingCost = 70;

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="font-serif fw-bold mb-1 fs-3">Order {order.orderNumber || `UNF-${order.id}`}</h1>
            <p className="text-dark mb-0 fs-5">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="bg-light rounded-pill px-3 py-1 fs-6 fw-medium border">
            Total : ₹ {order.totalAmount}
          </div>
        </div>

        {/* Tracking Status */}
        <div className="info-block-light mb-5 py-4 px-4 px-md-5 position-relative z-1">
          <h4 className="fw-bold fs-5 mb-5 ps-2">Tracking Status</h4>
          
          <div className="tracking-timeline">
            {/* Step 1: Placed */}
            <div className={`tracking-item ${['PLACED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(order.status) >= 0 ? 'active' : ''}`}>
              <div className="tracking-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-list-ul" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                </svg>
              </div>
              <div className="tracking-content">
                <div className="tracking-title">Order Placed</div>
                <div className="tracking-desc">We've received your order.</div>
              </div>
            </div>

            {/* Step 2: Packed */}
            <div className={`tracking-item ${['PACKED', 'SHIPPED', 'DELIVERED'].indexOf(order.status) >= 0 ? 'active' : ''}`}>
              <div className="tracking-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-box-seam-fill" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003 6.97 2.789ZM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6 6.5-2.6v-.4l-.846-.339L8 5.961 5.446 4.939 10.404 3V2Z"/>
                </svg>
              </div>
              <div className="tracking-content">
                <div className="tracking-title">Packed</div>
                <div className="tracking-desc">Items are packed and ready</div>
              </div>
            </div>

            {/* Step 3: Shipped */}
            <div className={`tracking-item ${['SHIPPED', 'DELIVERED'].indexOf(order.status) >= 0 ? 'active' : ''}`}>
              <div className="tracking-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-truck" viewBox="0 0 16 16">
                  <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 7V5.5a.5.5 0 0 0-.5-.5H11v2h1zM11 8h2.02a.5.5 0 0 1 .39.188l1.48 1.85a.5.5 0 0 1 .11.312V10.5a.5.5 0 0 1-.5.5h-.766a2 2 0 0 1-3.746 0H11V8zm-5 3a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm7 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0z"/>
                </svg>
              </div>
              <div className="tracking-content">
                <div className="tracking-title">Shipped</div>
                <div className="tracking-desc">Handed over to delivery partner</div>
              </div>
            </div>

            {/* Step 4: Delivered */}
            <div className={`tracking-item ${order.status === 'DELIVERED' ? 'active' : ''}`}>
              <div className="tracking-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
              </div>
              <div className="tracking-content">
                <div className="tracking-title">Delivered</div>
                <div className="tracking-desc">Delivered to your address</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Grid */}
        <div className="row g-4">
          
          {/* Left Column */}
          <div className="col-md-7">
            <div className="info-block-light p-0 overflow-hidden h-100">
              <div className="bg-white p-3 border-bottom d-flex align-items-center">
                <span className="fw-bold">Order Items</span>
              </div>
              {order.items && order.items.map((item, idx) => (
                <div className="p-4 d-flex align-items-center bg-light border-bottom" key={idx}>
                  <div className="bg-white p-2 rounded me-4 border" style={{ width: '90px', height: '90px' }}>
                    <img src={item.imageUrl || item.image || "/images/sweater.jpg"} alt="Item" className="w-100 h-100 object-fit-cover" />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold mb-1 fs-5">{item.productName || item.name}</div>
                    <div className="text-dark mb-1 fs-6">Size : <span className="fw-bold">{item.size}</span> | Color : {item.color}</div>
                    <div className="text-dark fs-6">Qty : {item.quantity}</div>
                  </div>
                  <div className="fw-bold fs-5">
                    ₹ {item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-5 d-flex flex-column gap-4">
            
            {/* Payment Details */}
            <div className="info-block-light h-100 p-4">
              <h3 className="font-serif fw-bold mb-4 pb-2 text-center fs-4">Payment Details</h3>
              
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-medium">Subtotal</span>
                <span>₹ {order.totalAmount - shippingCost}</span>
              </div>
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-medium">Shipping</span>
                <span>₹ {shippingCost}</span>
              </div>
              
              <div className="d-flex justify-content-between pt-3 border-top border-dark mb-3">
                <span className="fw-medium">Total Paid</span>
                <span className="fw-bold">₹ {order.totalAmount}</span>
              </div>
              <div className="bg-white border rounded-pill d-inline-block px-3 py-1 fw-bold" style={{ fontSize: '0.8rem' }}>
                {order.paymentMethod || 'UPI'}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="info-block-light h-100 p-4">
              <h3 className="font-serif fw-bold mb-3 fs-4">Delivery Address</h3>
              
              <p className="mb-2 fs-5">{order.shippingAddress?.fullName || 'Krish Patel'}</p>
              <p className="mb-2 fs-5">
                {order.shippingAddress?.addressLine || 'ABC'}, {order.shippingAddress?.city || 'Pune'},<br/>
                {order.shippingAddress?.state || 'Maharashtra'} - {order.shippingAddress?.pincode || '123456'}
              </p>
              <p className="mb-0 fs-5">{order.shippingAddress?.phone || '+91 1234567890'}</p>
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Orders;
