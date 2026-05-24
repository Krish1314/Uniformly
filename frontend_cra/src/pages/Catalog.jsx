import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { productApi } from '../api/productApi';
import { schoolApi } from '../api/schoolApi';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    schoolId: searchParams.get('schoolId') || '',
    category: '',
    sort: '',
  });

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const response = await schoolApi.getSchools();
        setSchools(response.data);
      } catch (err) {
        console.error("Failed to load schools", err);
      }
    };
    loadSchools();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = { page, size: 12 };
        if (filters.search) params.search = filters.search;
        if (filters.schoolId) params.schoolId = filters.schoolId;
        if (filters.category) params.category = filters.category;
        if (filters.sort) params.sort = filters.sort;

        const response = await productApi.getProducts(params);
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.totalItems);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [filters, page]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setPage(0); // Reset to first page on filter change
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 fade-in flex-grow-1">
      <div className="mb-5 pb-3 border-bottom">
        <h1 className="fw-bold fs-3 mb-2">All Uniforms</h1>
        <p className="text-muted">Browse our complete collection of school apparel and accessories.</p>
      </div>
      
      <div className="row">
        {/* Left Sidebar Filters */}
        <div className="col-lg-3 mb-4 pe-lg-5">
          <h4 className="fw-bold fs-5 mb-4">Filters</h4>
          
          <div className="mb-4">
            <div className="filter-label">Search</div>
            <div className="position-relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-search position-absolute text-muted" style={{left: '12px', top: '12px'}} viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              <input 
                type="text" 
                name="search"
                className="filter-input ps-4" 
                placeholder="Search Products..." 
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="filter-label">School</div>
            <select 
              name="schoolId"
              className="filter-input form-select shadow-none"
              value={filters.schoolId}
              onChange={handleFilterChange}
            >
              <option value="">All Schools</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <div className="filter-label">Category</div>
            <select 
              name="category"
              className="filter-input form-select shadow-none"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="shirts">Shirts</option>
              <option value="bottoms">Bottoms</option>
              <option value="outerwear">Outerwear</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
          
          <div className="mb-4">
            <div className="filter-label">Sort By</div>
            <select 
              name="sort"
              className="filter-input form-select shadow-none"
              value={filters.sort}
              onChange={handleFilterChange}
            >
              <option value="">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Right Content Grid */}
        <div className="col-lg-9">
          <div className="mb-4 text-muted d-flex justify-content-between align-items-center">
            <span>Showing {products.length} of {totalItems} results</span>
            <span className="small">Page {page + 1} of {totalPages}</span>
          </div>
          
          <div className="row g-4 mb-5">
            {loading ? (
              // Skeleton Loading State
              Array.from({ length: 6 }).map((_, index) => (
                <div className="col-sm-6 col-lg-4" key={`skeleton-${index}`}>
                  <div className="skeleton-card">
                    <div className="skeleton skeleton-img"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text short"></div>
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              // Actual Products
              products.map((product) => (
                <div className="col-sm-6 col-lg-4" key={product.id}>
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
              ))
            ) : (
              // No Products Found
              <div className="col-12 text-center py-5">
                <p className="text-muted">No products found matching your filters.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button 
                className="btn btn-outline-dark px-4" 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <div className="d-flex align-items-center px-3 border rounded fw-medium">
                {page + 1}
              </div>
              <button 
                className="btn btn-outline-dark px-4" 
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Catalog;
