"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { productApi } from '@/api/productApi';
import { schoolApi } from '@/api/schoolApi';
import Footer from '@/components/Footer';

function CatalogContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    schoolId: searchParams.get('schoolId') || '',
    categoryId: '',
    sort: '',
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [schoolsRes, categoriesRes] = await Promise.all([
          schoolApi.getSchools(),
          productApi.getCategories()
        ]);
        setSchools(schoolsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await productApi.getProducts(filters);
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto py-12 px-4 flex-grow">
        <div className="mb-10 pb-4 border-b">
          <h1 className="text-3xl font-extrabold mb-2">All Uniforms</h1>
          <p className="text-gray-500">Browse our complete collection of school apparel and accessories.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-xl mb-6">Filters</h4>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Search</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="search"
                    className="w-full bg-[#f0f2f5] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-black outline-none" 
                    placeholder="Search Products..." 
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">School</label>
                <select 
                  name="schoolId"
                  className="w-full bg-[#f0f2f5] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-black outline-none appearance-none"
                  value={filters.schoolId}
                  onChange={handleFilterChange}
                >
                  <option value="">All Schools</option>
                  {schools.map((school: any) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Category</label>
                <select 
                  name="categoryId"
                  className="w-full bg-[#f0f2f5] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-black outline-none appearance-none"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Sort By</label>
                <select 
                  name="sort"
                  className="w-full bg-[#f0f2f5] border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-black outline-none appearance-none"
                  value={filters.sort}
                  onChange={handleFilterChange}
                >
                  <option value="">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 text-sm text-gray-500">
              {loading ? 'Loading products...' : `Showing ${products.length} results`}
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 aspect-[4/5] rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Link href={`/product/${product.id}`} key={product.id}>
                    <ProductCard product={product} />
                  </Link>
                ))}
                {products.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400">
                    No products found matching your filters.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading Catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
