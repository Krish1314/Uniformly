import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { addressApi } from '../api/addressApi';
import { cartApi } from '../api/cartApi';
import { checkoutApi } from '../api/checkoutApi';

const Checkout = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        const [addressRes, cartRes] = await Promise.all([
          addressApi.getAddresses(),
          cartApi.getCart(),
        ]);
        setAddresses(addressRes.data);
        setCart(cartRes.data);
      } catch (err) {
        console.error("Failed to load checkout data", err);
      }
    };
    loadCheckoutData();
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();

    try {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      if (!defaultAddress) {
        alert("Please add an address first.");
        return;
      }

      const response = await checkoutApi.checkout({
        addressId: defaultAddress.id,
        paymentMethod,
      });

      navigate(`/confirmation?orderId=${response.data.id}`);
    } catch (err) {
      console.error("Checkout failed", err);
      alert("Checkout failed. Please try again.");
    }
  };

  if (!cart || addresses.length === 0) {
    return <div className="container py-5 mt-5 text-center">Loading checkout...</div>;
  }

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1">
        <h1 className="font-serif fw-bold mb-4 pb-4 border-bottom border-dark">Secure Checkout</h1>
        
        <form onSubmit={handleCheckout} className="row g-5 mt-2">
          {/* Left Column - Forms */}
          <div className="col-lg-8">
            
            {/* Contact Info Block */}
            <div className="info-block mb-4">
              <div className="d-flex align-items-center mb-4">
                <div className="step-number">1</div>
                <h2 className="font-serif fw-bold fs-3 mb-0">Contact Information</h2>
              </div>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="fw-semibold mb-2">Full Name</label>
                  <input type="text" className="form-control border-0 p-3" value={defaultAddress.fullName} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="fw-semibold mb-2">Phone Number</label>
                  <input type="text" className="form-control border-0 p-3" value={defaultAddress.phone} readOnly />
                </div>
              </div>
            </div>

            {/* Shipping Address Block */}
            <div className="info-block mb-4">
              <div className="d-flex align-items-center mb-4">
                <div className="step-number">2</div>
                <h2 className="font-serif fw-bold fs-3 mb-0">Shipping Address</h2>
              </div>
              
              <div className="row g-4">
                <div className="col-12">
                  <label className="fw-semibold mb-2">Street Address</label>
                  <input type="text" className="form-control border-0 p-3" value={defaultAddress.addressLine} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="fw-semibold mb-2">City</label>
                  <input type="text" className="form-control border-0 p-3" value={defaultAddress.city} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="fw-semibold mb-2">State</label>
                  <input type="text" className="form-control border-0 p-3" value={defaultAddress.state} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="fw-semibold mb-2">Pincode</label>
                  <input type="text" className="form-control border-0 p-3" value={defaultAddress.pincode} readOnly />
                </div>
              </div>
            </div>

            {/* Payment Method Block */}
            <div className="info-block mb-4">
              <div className="d-flex align-items-center mb-4">
                <div className="step-number">3</div>
                <h2 className="font-serif fw-bold fs-3 mb-0">Payment Method</h2>
              </div>
              
              <div className="row g-3">
                <div className="col-12">
                  <div className="radio-card" onClick={() => setPaymentMethod('UPI')}>
                    <input type="radio" checked={paymentMethod === 'UPI'} onChange={() => {}} />
                    <span className="fs-5">UPI / QR Code</span>
                  </div>
                </div>
                <div className="col-12">
                  <div className="radio-card" onClick={() => setPaymentMethod('Debit')}>
                    <input type="radio" checked={paymentMethod === 'Debit'} onChange={() => {}} />
                    <span className="fs-5">Debit Card</span>
                  </div>
                </div>
                <div className="col-12">
                  <div className="radio-card" onClick={() => setPaymentMethod('Credit')}>
                    <input type="radio" checked={paymentMethod === 'Credit'} onChange={() => {}} />
                    <span className="fs-5">Credit Card</span>
                  </div>
                </div>
                <div className="col-12">
                  <div className="radio-card" onClick={() => setPaymentMethod('NetBanking')}>
                    <input type="radio" checked={paymentMethod === 'NetBanking'} onChange={() => {}} />
                    <span className="fs-5">Net Banking</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Order Summary */}
          <div className="col-lg-4">
            <div className="summary-block sticky-top" style={{ top: '100px' }}>
              <h3 className="font-serif fw-bold mb-4 pb-2">Order Summary</h3>
              
              <div className="summary-row">
                <span className="text-muted">Subtotal ( {cart.itemCount} items )</span>
                <span className="fw-medium">INR {cart.subtotal}</span>
              </div>
              <div className="summary-row">
                <span className="text-muted">Shipping</span>
                <span className="fw-medium">INR 70</span>
              </div>
              
              <div className="summary-total border-top border-dark mt-4 pt-4">
                <span className="fs-4">Total</span>
                <div className="fs-3 fw-bold">INR {(Number(cart.subtotal) + 70).toLocaleString()}</div>
              </div>

              <button type="submit" className="btn btn-solid w-100 mt-4 px-4 py-3 fs-5">
                Pay {(Number(cart.subtotal) + 70).toLocaleString()}
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
