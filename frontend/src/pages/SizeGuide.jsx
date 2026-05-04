import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
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

        <div className="row g-5">
          {categories.map((cat) => (
            <div key={cat.id} className="col-12 mb-5">
              <div className="info-block-light p-4 p-md-5">
                <h2 className="fw-bold fs-3 mb-4 pb-2 border-bottom">{cat.name}</h2>
                <div className="row align-items-center">
                  <div className="col-lg-6 mb-4 mb-lg-0">
                    <div className="bg-white rounded p-3 shadow-sm text-center">
                      {cat.sizeGuideImageUrl ? (
                        <img 
                          src={cat.sizeGuideImageUrl} 
                          alt={`${cat.name} Size Guide`} 
                          className="img-fluid rounded"
                          style={{ maxHeight: '400px' }}
                        />
                      ) : (
                        <div className="py-5 text-muted">
                          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-rulers mb-3" viewBox="0 0 16 16">
                            <path d="M1 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5v-1H2v-1h4v-1H3v-1h3v-1H2v-1h4v-1H3v-1h3V7H2V6h4V5H3V4h3V3H2V2h4V1a1 1 0 0 0-1-1H1z"/>
                            <path d="M16 2a2 2 0 0 0-2-2H7v15h7a2 2 0 0 0 2-2V2zM9 1h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H9V1z"/>
                          </svg>
                          <p>Size guide image coming soon.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6 ps-lg-5">
                    <h4 className="fw-bold mb-3">Measurement Instructions</h4>
                    <p className="text-dark fs-5" style={{ whiteSpace: 'pre-line' }}>
                      {cat.sizeGuideNotes || "General sizing info: Please refer to our standard fit charts. If between sizes, we recommend sizing up for comfort."}
                    </p>
                    <div className="mt-4 p-3 bg-white rounded border-start border-4 border-dark">
                      <p className="mb-0 fw-medium">Tip: If you're unsure about a size, feel free to visit our store for a trial fitting.</p>
                    </div>
                  </div>
                </div>
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
