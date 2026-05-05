import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="footer mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="mb-4 mb-lg-0">
            <h5 className="footer-heading fs-5 mb-2">Uniformly</h5>
            <p className="footer-text mt-3">
              Premium school uniforms, delivered to your door.
            </p>
          </div>
          
          <div className="mb-4 mb-sm-0">
            <h5 className="footer-heading">Shop</h5>
            <Link href="/catalog" className="footer-link">Browse by School</Link>
            <Link href="/catalog" className="footer-link">All Products</Link>
          </div>
          
          <div className="mb-4 mb-sm-0">
            <h5 className="footer-heading">Support</h5>
            <Link href="/orders" className="footer-link">Track Order</Link>
            <Link href="#" className="footer-link">Returns & Exchanges</Link>
            <Link href="/size-guide" className="footer-link">Size Guide</Link>
          </div>
          
          <div className="mb-4 mb-sm-0">
            <h5 className="footer-heading">Admin</h5>
            <Link href="/admin" className="footer-link">Dashboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
