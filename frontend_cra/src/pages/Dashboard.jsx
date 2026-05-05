import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { productApi } from '../api/productApi';

const Dashboard = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const response = await productApi.getFeaturedProducts();
        setFeaturedProducts(response.data);
      } catch (err) {
        console.error("Failed to load featured products", err);
      }
    };
    loadFeaturedProducts();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="container">
          <h1 className="hero-title font-serif">School uniforms,<br/>simplified.</h1>
          <p className="hero-subtitle">
            Premium quality schoolwear delivered to your door. Find your school,
            pick the right size, and check out without friction.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/Schools" className="btn btn-solid">Find your School</Link>
            <Link to="/catalog" className="btn btn-outline">Shop All</Link>
          </div>
        </div>
      </section>

      {/* Featured Uniforms */}
      <section className="container mb-5">
        <h2 className="fw-bold fs-3 mb-4">Featured Uniforms</h2>
        
        <div className="row g-4">
          {featuredProducts.map(product => (
            <div className="col-sm-6 col-lg-3" key={product.id}>
              <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                <ProductCard product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  school: product.school?.name || product.school,
                  category: product.category,
                  image: product.imageUrl
                }} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Shop With Us Banner */}
      <section className="features-section">
        <div className="container text-center">
          <h3 className="features-title font-serif">Why Shop With Us</h3>
          
          <div className="row g-4 mt-2">
            <div className="col-md-4">
              <div className="feature-number">1</div>
              <h4 className="feature-heading">Guaranteed Fit</h4>
              <p className="feature-text">
                Detailed size guides and easy exchanges ensure the perfect fit for growing kids.
              </p>
            </div>
            <div className="col-md-4">
              <div className="feature-number">2</div>
              <h4 className="feature-heading">Premium Quality</h4>
              <p className="feature-text">
                Durable, breathable fabrics designed to withstand the rigors of the school day.
              </p>
            </div>
            <div className="col-md-4">
              <div className="feature-number">3</div>
              <h4 className="feature-heading">Fast Delivery</h4>
              <p className="feature-text">
                Track your order every step of the way with standard delivery across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
