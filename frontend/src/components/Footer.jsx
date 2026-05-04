import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 mb-4 mb-lg-0">
            <h5 className="footer-heading fs-5 mb-2">Uniformly</h5>
            <p className="footer-text mt-3">
              Premium school uniforms, delivered to your door.
            </p>
          </div>
          
          <div className="col-lg-3 col-sm-6 mb-4 mb-sm-0">
            <h5 className="footer-heading">Shop</h5>
            <Link to="/catalog" className="footer-link">Browse by School</Link>
            <Link to="/catalog" className="footer-link">All Products</Link>
          </div>
          
          <div className="col-lg-3 col-sm-6 mb-4 mb-sm-0">
            <h5 className="footer-heading">Support</h5>
            <Link to="/orders" className="footer-link">Track Order</Link>
            <Link to="#" className="footer-link">Returns & Exchanges</Link>
            <Link to="#" className="footer-link">Size Guide</Link>
          </div>
          
          <div className="col-lg-3 col-sm-6">
            <h5 className="footer-heading">Admin</h5>
            <Link to="/admin" className="footer-link">Dashboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
