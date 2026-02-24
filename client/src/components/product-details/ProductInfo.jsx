import React from 'react';

const ProductInfo = ({ product, stock, formatPrice }) => {
  return (
    <div className="space-y-10 border-b border-gray-100 pb-10">

      {/* Header Info - Pill Shape for Category */}
      <div className="flex items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-200 px-3 py-1 rounded-full">
          {product.category?.name}
        </span>
      </div>

      {/* Title & Price - Sans Serif, Uppercase, Normal Tracking */}
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-medium uppercase text-black leading-tight tracking-normal">
          {product.name}
        </h1>

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-2xl font-light tracking-tight text-black font-mono">
                ${product.price}
              </p>
              {/* Approximate Price Hook Usage */}
              <p className="text-xs text-gray-400 mt-1 font-normal">
                ≈ {formatPrice(product.price)}
              </p>
            </div>

            {stock <= 5 && stock > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 animate-pulse">
                Limited Run ({stock})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed font-light">
        {product.description || "A masterfully crafted artifact that embodies the centuries-old heritage of the central highlands. Using only locally sourced organic materials, each element is formed by hand."}
      </p>
    </div>
  );
};

export default ProductInfo;
