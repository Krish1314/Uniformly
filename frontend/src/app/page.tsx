"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import axios from 'axios';

// Get backend URL from env
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://uniformly.onrender.com/api/v1';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/featured`);
        setFeaturedProducts(response.data);
      } catch (err) {
        console.error("Failed to load featured products", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedProducts();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="bg-white py-24 md:py-32 text-center">
        <div className="container mx-auto px-4">
          <h1 className="hero-title">
            School uniforms,<br/>simplified.
          </h1>
          <p className="text-lg md:text-xl text-[#111111] max-w-2xl mx-auto mb-10 leading-relaxed">
            Premium quality schoolwear delivered to your door. Find your school,
            pick the right size, and check out without friction.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/schools" className="btn-solid">
              Find your School
            </Link>
            <Link href="/catalog" className="btn-outline">
              Shop All
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Uniforms */}
      <section className="container mx-auto px-4 mb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#080808]">Featured Uniforms</h2>
            <p className="text-[#555555] mt-2">Handpicked essentials for the upcoming season</p>
          </div>
          <Link href="/catalog" className="text-[#080808] font-bold border-b-2 border-[#080808] hover:opacity-70 transition-opacity">
            View All
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-gray-100 animate-pulse aspect-square rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="block group">
                <ProductCard product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  school: product.schoolName || product.school?.name,
                  category: product.categoryName || product.category?.name,
                  image: product.image_url || product.imageUrl
                }} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Why Shop With Us Banner */}
      <section className="bg-[#f4f6f8] py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold tracking-[2px] uppercase mb-12 text-[#080808]">Why Shop With Us</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full font-bold text-sm shadow-sm mb-4">1</div>
              <h4 className="font-serif text-2xl font-bold mb-3">Guaranteed Fit</h4>
              <p className="text-[#555555] text-sm leading-relaxed max-w-[250px] mx-auto">
                Detailed size guides and easy exchanges ensure the perfect fit for growing kids.
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full font-bold text-sm shadow-sm mb-4">2</div>
              <h4 className="font-serif text-2xl font-bold mb-3">Premium Quality</h4>
              <p className="text-[#555555] text-sm leading-relaxed max-w-[250px] mx-auto">
                Durable, breathable fabrics designed to withstand the rigors of the school day.
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full font-bold text-sm shadow-sm mb-4">3</div>
              <h4 className="font-serif text-2xl font-bold mb-3">Fast Delivery</h4>
              <p className="text-[#555555] text-sm leading-relaxed max-w-[250px] mx-auto">
                Track your order every step of the way with standard delivery across India.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
