import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { productApi } from '../api/productApi';
import { cartApi } from '../api/cartApi';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        const prodRes = await productApi.getProductById(id);
        setProduct(prodRes.data);
        if (prodRes.data.variants && prodRes.data.variants.length > 0) {
          setSize(prodRes.data.variants[0].size);
          setColor(prodRes.data.variants[0].color);
        }

        const relatedRes = await productApi.getRelatedProducts(id);
        setRelatedProducts(relatedRes.data);
      } catch (err) {
        console.error("Failed to load product details", err);
      }
    };
    loadProductDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    const selectedVariant = product.variants && product.variants.length > 0
      ? product.variants.find((variant) => variant.size === size && variant.color === color)
      : null;

    let variantId = selectedVariant ? selectedVariant.id : null;
    
    if (!selectedVariant && product.variants && product.variants.length > 0) {
      alert("Selected size/color is not available");
      return;
    }

    try {
      await cartApi.addItem({
        productId: product.id,
        variantId: variantId,
        quantity: qty,
      });
      await refreshCart(); // update badge in navbar
      navigate("/cart");
    } catch (err) {
      alert("Failed to add to cart. Please make sure you are logged in.");
    }
  };

  // Extract unique sizes and colors
  const sizes = product?.variants && product.variants.length > 0 
    ? [...new Set(product.variants.map(v => v.size))] 
    : ['S', 'M', 'L', 'XL'];
  const colors = product?.variants && product.variants.length > 0 
    ? [...new Set(product.variants.map(v => v.color))] 
    : ['Navy', 'Default'];

  useEffect(() => {
    if (product) {
      if (sizes.length > 0 && !size) setSize(sizes[0]);
      if (colors.length > 0 && !color) setColor(colors[0]);
    }
  }, [product, sizes, colors]);

  if (!product) return <div className="container py-5 mt-4 text-center">Loading...</div>;

  const mainImage = product.imageUrl || "/images/sweater.jpg";

  return (
    <div className="fade-in">
      <div className="container py-5 mt-4">
        <div className="row mb-5 pb-5">
          {/* Left Column - Image Gallery */}
          <div className="col-lg-6 mb-5 mb-lg-0 pe-lg-5">
            <div className="bg-light rounded-3 mb-3 d-flex align-items-center justify-content-center p-5" style={{ aspectRatio: '1', backgroundColor: '#eaddd5' }}>
              <img src={mainImage} alt={product.name} className="img-fluid" style={{ maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div className="d-flex gap-3">
              <div className="border border-dark rounded bg-light p-2" style={{ width: '80px', height: '80px', cursor: 'pointer', backgroundColor: '#eaddd5' }}>
                <img src={mainImage} alt="Thumbnail 1" className="img-fluid w-100 h-100" style={{ objectFit: 'cover' }} />
              </div>
              <div className="border rounded bg-light p-2 border-light" style={{ width: '80px', height: '80px', cursor: 'pointer', backgroundColor: '#eaddd5', opacity: 0.7 }}>
                <img src={mainImage} alt="Thumbnail 2" className="img-fluid w-100 h-100" style={{ objectFit: 'cover' }} />
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="col-lg-6 ps-lg-4">
            <div className="school-name mb-2">{typeof product.school === 'object' ? (product.school?.name || '').toUpperCase() : (product.school || '').toUpperCase()} • {product.category?.toUpperCase()}</div>
            <h1 className="product-details-title">{product.name}</h1>
            <div className="fs-4 fw-bold mb-4">INR {product.price}</div>
            
            <p className="text-dark mb-5" style={{ lineHeight: '1.6' }}>
              {product.description}
            </p>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-bold fs-5">Select Size</div>
                <Link to="#" className="text-dark text-decoration-none fw-medium" style={{ fontSize: '0.85rem' }}>Size Guide</Link>
              </div>
              <div className="d-flex flex-wrap">
                {sizes.map(s => (
                  <div 
                    key={s} 
                    className={`pill-selector ${size === s ? 'active' : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5 pb-3 border-bottom">
              <div className="fw-bold fs-5 mb-3">Select Color</div>
              <div className="d-flex flex-wrap">
                {colors.map(c => (
                  <div 
                    key={c} 
                    className={`pill-selector ${color === c ? 'active' : ''}`}
                    onClick={() => setColor(c)}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex align-items-center gap-4">
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <div className="qty-display">{qty}</div>
                <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <button className="btn btn-solid flex-grow-1" style={{ padding: '14px 24px', fontSize: '1.1rem' }} onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="pt-5 border-top border-light">
          <div className="row g-4">
            {relatedProducts.map(relProduct => (
              <div className="col-md-4" key={relProduct.id}>
                <Link to={`/product/${relProduct.id}`} className="text-decoration-none text-dark">
                  <ProductCard product={{
                    id: relProduct.id,
                    name: relProduct.name,
                    price: relProduct.price,
                    school: relProduct.school,
                    category: relProduct.category,
                    image: relProduct.imageUrl
                  }} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetails;
