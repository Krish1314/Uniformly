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
        <div className="info-block-light mb-4 py-4 px-5 position-relative z-1">
          <h4 className="fw-bold fs-5 mb-5">Tracking Status</h4>
          
          <div className="timeline-container pb-2">
            <div className={`timeline-step ${['PLACED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(order.status) >= 0 ? '' : 'text-muted'}`}>
              <div className="timeline-icon-wrapper border border-dark">
                ✓
              </div>
              <div className="timeline-title">Order Placed</div>
            </div>
            
            <div className={`timeline-step ${['PACKED', 'SHIPPED', 'DELIVERED'].indexOf(order.status) >= 0 ? '' : 'text-muted'}`}>
              <div className="timeline-icon-wrapper border border-dark">
                ✓
              </div>
              <div className="timeline-title">Packed</div>
            </div>
            
            <div className={`timeline-step ${['SHIPPED', 'DELIVERED'].indexOf(order.status) >= 0 ? '' : 'text-muted'}`}>
              <div className="timeline-icon-wrapper border border-dark">
                ✓
              </div>
              <div className="timeline-title">Shipped</div>
            </div>
            
            <div className={`timeline-step ${order.status === 'DELIVERED' ? '' : 'text-muted'}`}>
              <div className="timeline-icon-wrapper border border-dark">
                ✓
              </div>
              <div className="timeline-title">Delivered</div>
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
