"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '../../../hooks/useToast';
import UserLayout from '../../../components/layout/UserLayout';
import { getProductById, addToCart } from '../../../lib/api/auth';
import { isAuthenticated, getUserId } from '../../../lib/api/config';
import type { Product } from '../../../types/index';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(params.id);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        setProduct(response[0]);
      } else if (response.data) {
        setProduct(response.data);
      } else if (response.id) {
        setProduct(response);
      } else {
        toast({
          title: "Error",
          description: "Failed to load product",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);

      const userId = getUserId();
      if (!userId) {
        toast({
          title: "Error",
          description: "User ID not found. Please login again.",
          variant: "destructive",
        });
        return;
      }

      // Call the addToCart API
      const response = await addToCart({
        userId: userId,
        productId: product.id,
        quantity: quantity,
      });

      console.log('Add to cart response:', response);

      // Check if the API call was successful
      if (response && (response.success || !response.error)) {
        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name} has been added to your cart`,
        });

        // Reset quantity after successful add
        setQuantity(1);

        // Trigger a storage event to update cart count in header
        window.dispatchEvent(new Event('storage'));
      } else {
        toast({
          title: "Error",
          description: response?.message || response?.error || "Failed to add item to cart",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please login to continue",
        variant: "destructive",
      });
      return;
    }

    handleAddToCart();
    // Small delay to ensure cart is updated
    setTimeout(() => {
      router.push('/cart');
    }, 300);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!product) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Product not found</h3>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/shop')}>
              Back to Shop
            </Button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/shop')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={
                product.images?.[0]
                  ? `https://gaushalaecommerce.runasp.net${product.images[0]}`
                  : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'
              }
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
              }}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
                {product.name}
              </h1>
              <p className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                ₹ {Number(product.price).toFixed(2)}
              </p>
              
              {product.stockQty > 0 ? (
                <div className="flex items-center gap-2 mb-6">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm text-muted-foreground">
                    {
                      product.stockQty === 0
                        ? 'Out of Stock'
                        : product.stockQty < 10
                          ? `Only ${product.stockQty} left in stock`
                          : 'In Stock'
                    }
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-6">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="text-sm text-red-500">Out of Stock</span>
                </div>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stockQty > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                    disabled={quantity >= product.stockQty}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1"
                disabled={product.stockQty === 0 || addingToCart}
                onClick={handleAddToCart}
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                disabled={product.stockQty === 0 || addingToCart}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            {!isAuthenticated() && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Please login to add items to cart
              </p>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}