import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import SizeGuideTabs from '../components/SizeGuideTabs';
import { categoryApi } from '../api/categoryApi';

const SizeGuide = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="container py-5 mt-5 text-center">Loading size guides...</div>;
  }

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-5 flex-grow-1">
        <div className="text-center mb-5">
          <h1 className="fw-bold fs-2 mb-2">Size Guide</h1>
          <p className="text-muted">Find the perfect fit for your school uniform.</p>
        </div>

        <div className="row">
          {categories.map((cat) => (
            <div key={cat.id} className="col-12 mb-5">
              <div className="info-block-light p-4 p-md-5">
                <h2 className="fw-bold fs-3 mb-4 pb-2 border-bottom">{cat.name}</h2>
                <SizeGuideTabs category={cat} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SizeGuide;
