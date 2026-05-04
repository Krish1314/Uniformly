import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1" style={{ maxWidth: '900px' }}>
        
        {/* Top Block */}
        <div className="info-block text-center mb-4 position-relative overflow-hidden pt-5 pb-5">
          <div className="position-absolute top-0 start-0 w-100 bg-success opacity-50" style={{ height: '8px' }}></div>
          
          <div className="d-flex justify-content-center mb-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', backgroundColor: '#e2f2e9', color: '#198754' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-check-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
              </svg>
            </div>
          </div>
          
          <h1 className="font-serif fw-bold mb-3">Order Confirmed !</h1>
          <p className="text-dark fs-5 mb-4 px-3" style={{ lineHeight: '1.6' }}>
            Thank you for shopping with Uniformly, Krish.<br/>
            We have sent a confirmation email to <span className="fw-bold">abc@gmail.com</span>
          </p>
          
          <div className="bg-white rounded px-4 py-2 d-inline-block fw-medium mb-5 shadow-sm border">
            Order Number : <span className="fw-bold">UNF-MODHWRSH-JK5K</span>
          </div>
          
          <div className="d-flex justify-content-center gap-4">
            <Link to="/orders" className="fw-bold text-dark text-decoration-none">View Order Status</Link>
            <Link to="/catalog" className="btn btn-solid py-2 px-4 rounded-pill">Continue Shopping</Link>
          </div>
        </div>

        {/* Middle Grid */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="info-block-light h-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-geo-alt-fill mb-4" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
              </svg>
              <div className="fw-bold fs-5 mb-2">Krish Patel</div>
              <p className="mb-2 fs-5">ABC , Pune, Maharashtra , 123456</p>
              <p className="mb-0 fs-5">+91 1234567890</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-block-light h-100">
              <h3 className="font-serif fw-bold mb-4 pb-2 text-center">Payment Details</h3>
              
              <div className="d-flex justify-content-between mb-3 fs-5">
                <span className="fw-medium">Payment Method</span>
                <span className="fw-bold">UPI</span>
              </div>
              <div className="d-flex justify-content-between mb-3 fs-5">
                <span className="fw-medium">Subtotal</span>
                <span className="fw-bold">₹ 1999</span>
              </div>
              <div className="d-flex justify-content-between mb-4 fs-5">
                <span className="fw-medium">Shipping</span>
                <span>₹ 70</span>
              </div>
              
              <div className="d-flex justify-content-between pt-3 border-top border-dark fs-5">
                <span className="fw-medium">Total Paid</span>
                <span className="fw-bold">₹ 2,069</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Block - Items */}
        <div className="info-block-light p-0 overflow-hidden">
          <div className="bg-white p-3 border-bottom d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box me-3" viewBox="0 0 16 16">
              <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
            </svg>
            <span className="fw-medium">Items in this order</span>
          </div>
          <div className="p-4 d-flex align-items-center bg-light">
            <div className="bg-white p-2 rounded me-4" style={{ width: '80px', height: '80px' }}>
              <img src="/images/sweater.jpg" alt="Item" className="w-100 h-100 object-fit-cover" />
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold mb-1">DPS Navy V-Neck Sweater</div>
              <div className="text-dark mb-1">Size : <span className="fw-bold">XL</span> | Color : Navy</div>
              <div className="text-dark">Qty : 1</div>
            </div>
            <div className="fw-bold">
              ₹ 2,069
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
