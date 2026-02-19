"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { getNewProducts } from "../lib/api/auth";
import { API_BASE_URL } from "../lib/api/config";
import type { Product, ProductSize } from "../types";

interface NewProductsProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function NewProducts({ limit = 4, showViewAll = true }: NewProductsProps) {
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
      setProducts(data.slice(0, limit)); // Limit the number of products shown
    } catch (error) {
      console.error("Error loading new products:", error);
      setError("Failed to load new products");
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product: Product): string => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      // Check if the image is an object with imageUrl property
      if (typeof firstImage === 'object' && firstImage !== null && 'imageUrl' in firstImage) {
        return `${API_BASE_URL}${firstImage.imageUrl}`;
      }
      // Fallback for string images
      if (typeof firstImage === 'string') {
        return `${API_BASE_URL}${firstImage}`;
      }
    }
    return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
  };

  const getAvailableSizes = (product: Product): ProductSize[] => {
    return product.sizes?.filter((size): size is ProductSize => 
      size && 
      typeof size === 'object' && 
      'inStock' in size && 
      size.inStock === true &&
      size.stockQty > 0
    ) || [];
  };

  const getDisplayPrice = (product: Product): string => {
    const availableSizes = getAvailableSizes(product);
    if (availableSizes.length > 0) {
      const prices = availableSizes.map(s => s.discountedPrice || s.price);
      const minPrice = Math.min(...prices);
      return `₹ ${minPrice.toFixed(2)}`;
    }
    return `₹ ${Number(product.basePrice || 0).toFixed(2)}`;
  };

  const getOriginalPrice = (product: Product): string | null => {
    const availableSizes = getAvailableSizes(product);
    if (availableSizes.length > 0) {
      const hasDiscount = availableSizes.some(s => 
        s.discountedPrice && s.discountedPrice < s.price
      );
      if (hasDiscount) {
        const minOriginalPrice = Math.min(...availableSizes.map(s => s.price));
        return `₹ ${minOriginalPrice.toFixed(2)}`;
      }
    }
    return null;
  };

  const hasDiscount = (product: Product): boolean => {
    const availableSizes = getAvailableSizes(product);
    return availableSizes.some(s => 
      s.discountedPrice && s.discountedPrice < s.price
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={loadNewProducts}>
          Try Again
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show anything if no new products
  }

  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">New Arrivals</h2>
          </div>
          {showViewAll && products.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => router.push('/new-products')}
              className="hover:bg-primary hover:text-white transition-colors"
            >
              View All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const totalStockQty = product.sizes?.reduce((total, size) => total + (size.stockQty || 0), 0) || 0;
            const availableSizes = getAvailableSizes(product);
            const hasStock = totalStockQty > 0 && availableSizes.length > 0;
            const displayPrice = getDisplayPrice(product);
            const originalPrice = getOriginalPrice(product);
            const productHasDiscount = hasDiscount(product);

            return (
              <Card
                key={product.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={getProductImage(product)}
                    alt={product.name || 'Product image'}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
                    }}
                  />
                  <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    New
                  </span>
                  {productHasDiscount && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Sale
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base mb-1 line-clamp-1">
                    {product.name || 'Unnamed Product'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.description || 'No description available'}
                  </p>
                  
                  {/* Price Display */}
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold text-primary">
                      {displayPrice}
                    </p>
                    {originalPrice && productHasDiscount && (
                      <p className="text-sm text-muted-foreground line-through">
                        {originalPrice}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {hasStock ? (
                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/products/${product.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  ) : (
                    <Button className="w-full" disabled>
                      Out of Stock
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}