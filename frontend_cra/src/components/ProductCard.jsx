import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const imageUrl = product?.image || "/images/sweater.jpg";
  const name = product?.name || "School Uniform Shirt";
  const price = product?.price || 999;
  const school = product?.school || "Delhi Public School";

  return (
    <div className="card product-card shadow-sm">
      <div className="product-image-wrapper">
        <img src={imageUrl} alt={name} className="product-image" />
      </div>
      <div className="product-details d-flex flex-column">
        <div className="school-name">{typeof school === 'object' ? school.name : school}</div>
        <div className="d-flex justify-content-between align-items-end mt-1">
          <div className="product-name mb-0">{name}</div>
          <div className="product-price">INR {price}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
