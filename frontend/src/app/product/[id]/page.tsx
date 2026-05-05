"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import SizeGuide from '@/components/SizeGuide';
import { productApi } from '@/api/productApi';
import { cartApi } from '@/api/cartApi';
import { useCart } from '@/context/CartContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { refreshCart } = useCart();
  
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const prodRes = await productApi.getProductDetails(id as string);
        setProduct(prodRes.data);
        
        if (prodRes.data.variants && prodRes.data.variants.length > 0) {
          setSize(prodRes.data.variants[0].size);
          setColor(prodRes.data.variants[0].color);
        }

        // Simulating related products fetch or using a specific API
        const relatedRes = await productApi.getFeaturedProducts();
        setRelatedProducts(relatedRes.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    const selectedVariant = product.variants?.find(
      (v: any) => v.size === size && v.color === color
    );

    try {
      await cartApi.addItem({
        productId: product.id,
        variantId: selectedVariant?.id || null,
        quantity: qty,
      });
      await refreshCart();
      router.push("/cart");
    } catch (err) {
      alert("Failed to add to cart. Please make sure you are logged in.");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading Product Details...</div>;
  if (!product) return <div className="p-20 text-center">Product not found.</div>;

  const sizes = product.variants ? [...new Set(product.variants.map((v: any) => v.size))] : [];
  const colors = product.variants ? [...new Set(product.variants.map((v: any) => v.color))] : [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto py-12 px-4 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-[#eaddd5] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-12">
              <img 
                src={product.image_url || "/placeholder-product.jpg"} 
                alt={product.name} 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-[#eaddd5] rounded-xl border-2 border-black p-2 cursor-pointer">
                <img src={product.image_url || "/placeholder-product.jpg"} className="w-full h-full object-contain" />
              </div>
              <div className="w-24 h-24 bg-[#eaddd5] rounded-xl border border-gray-200 p-2 cursor-pointer opacity-50">
                <img src={product.image_url || "/placeholder-product.jpg"} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span>{product.school?.name}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{product.category?.name}</span>
            </div>
            
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="text-2xl font-bold text-black mb-8">₹ {product.price}</div>
            
            <p className="text-gray-600 leading-relaxed mb-10 text-sm">
              {product.description || "Premium quality school uniform designed for comfort and durability. Made with school-approved materials and standards."}
            </p>

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider">Select Size</h4>
                <button 
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {sizes.length > 0 ? sizes.map((s: any) => (
                  <button 
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[50px] h-[50px] flex items-center justify-center rounded-xl font-bold text-sm transition-all border-2 ${size === s ? 'border-black bg-black text-white shadow-lg shadow-gray-200' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}`}
                  >
                    {s}
                  </button>
                )) : <span className="text-gray-400 italic">One Size Available</span>}
              </div>
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-10 pb-10 border-b border-gray-100">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Select Color</h4>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c: any) => (
                    <button 
                      key={c}
                      onClick={() => setColor(c)}
                      className={`px-6 h-[50px] flex items-center justify-center rounded-xl font-bold text-sm transition-all border-2 ${color === c ? 'border-black bg-black text-white shadow-lg shadow-gray-200' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and CTA */}
            <div className="flex items-center gap-6">
              <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center font-bold text-gray-500 hover:text-black transition-colors"
                >-</button>
                <div className="w-10 text-center font-bold">{qty}</div>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 flex items-center justify-center font-bold text-gray-500 hover:text-black transition-colors"
                >+</button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-grow bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="pt-20 border-t border-gray-100">
          <h2 className="text-2xl font-bold mb-10">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map((relProd: any) => (
              <Link href={`/product/${relProd.id}`} key={relProd.id}>
                <ProductCard product={relProd} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Size Guide Modal Overlay */}
      {showSizeGuide && product.category && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)}></div>
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold">{product.category.name} Size Guide</h3>
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="p-2 hover:bg-white rounded-full transition-colors shadow-sm border border-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
              <SizeGuide category={product.category} />
              <div className="mt-10 pt-6 border-t border-gray-100">
                <button 
                  className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
                  onClick={() => setShowSizeGuide(false)}
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
