import React from 'react';
import Image from 'next/image';

interface Product {
  id: number | string;
  name: string;
  price: number;
  school: string | { name: string };
  image?: string;
  imageUrl?: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  const imageUrl = product.image || product.imageUrl || "/placeholder-product.jpg";
  const name = product.name;
  const price = product.price;
  const school = typeof product.school === 'object' ? product.school.name : product.school;

  return (
    <div className="bg-[#f4f6f8] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group h-full flex flex-col">
      <div className="relative aspect-square w-full bg-[#eaddd5] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <div className="p-4 flex flex-col flex-grow bg-[#eef1f3]">
        <div className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-1">
          {school}
        </div>
        <div className="flex justify-between items-end mt-auto gap-2">
          <div className="font-bold text-sm text-[#080808] leading-tight flex-grow">{name}</div>
          <div className="font-bold text-sm text-[#080808] whitespace-nowrap">₹ {price}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
