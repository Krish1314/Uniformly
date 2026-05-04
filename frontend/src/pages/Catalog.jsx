import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productApi } from '../api/productApi';
import { schoolApi } from '../api/schoolApi';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [schools, setSchools] = useState([]);
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
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.schoolId) params.schoolId = filters.schoolId;
        if (filters.category) params.category = filters.category;
        if (filters.sort) params.sort = filters.sort;

        const response = await productApi.getProducts(params);
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    loadProducts();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="container py-5 fade-in">
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
          <div className="mb-4 text-muted">Showing {products.length} results</div>
          
          <div className="row g-4">
            {products.map((product) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
