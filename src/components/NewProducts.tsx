"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronRight } from "lucide-react";
import { getNewProducts } from "../lib/api/auth";
import { API_BASE_URL } from "../lib/api/config";
import type { Product } from "../types";

interface NewProductsProps {
  limit?: number;
  showViewAll?: boolean;
  onEmpty?: () => void;
}

export default function NewProducts({
  limit = 4,
  showViewAll = true,
  onEmpty,
}: NewProductsProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNewProducts();
  }, []);

  const loadNewProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNewProducts();
      const limitedProducts = data.slice(0, limit);

      setProducts(limitedProducts);

      if (limitedProducts.length === 0 && onEmpty) {
        onEmpty();
      }
    } catch (error) {
      console.error("Error loading new products:", error);
      setError("Failed to load new products");

      if (onEmpty) onEmpty();
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product: Product): string => {
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const firstImage = product.images[0];
      if (
        typeof firstImage === "object" &&
        firstImage !== null &&
        "imageUrl" in firstImage
      ) {
        return `${API_BASE_URL}${firstImage.imageUrl}`;
      }
      if (typeof firstImage === "string") {
        return `${API_BASE_URL}${firstImage}`;
      }
    }
    return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[100px]">
        <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 md:gap-4 min-w-max pb-1">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => router.push(`/products/${product.id}`)}
          className="flex-shrink-0 w-14 sm:w-16 md:w-20 lg:w-24 cursor-pointer group"
        >
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1 shadow-sm">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
              }}
            />
          </div>
          <h3 className="text-[10px] md:text-xs font-medium text-center truncate">
            {product.name}
          </h3>
        </div>
      ))}
      {showViewAll && (
        <div
          onClick={() => router.push('/new-products')}
          className="flex-shrink-0 w-10 sm:w-12 md:w-14 lg:w-16 h-full flex items-center justify-center cursor-pointer group"
        >
          <div className="text-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1 group-hover:bg-primary/20 transition-colors">
              <ChevronRight 
                size={12} 
                className="text-primary sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" 
              />
            </div>
            <span className="text-[8px] md:text-xs text-primary">View All</span>
          </div>
        </div>
      )}
    </div>
  );
}