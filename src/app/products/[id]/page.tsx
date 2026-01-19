"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Loader2, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '../../../hooks/useToast';
import UserLayout from '../../../components/layout/UserLayout';
import { getProductById, addToCart, extractData, extractMessage } from '../../../lib/api/auth';
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      let productId: string | number | null = null;
      
      if (!params.id) {
        toast({
          title: "Error",
          description: "Product ID is missing",
          variant: "destructive",
        });
        return;
      }
      
      if (Array.isArray(params.id)) {
        productId = params.id[0];
      } else {
        productId = params.id;
      }
      
      if (!productId) {
        toast({
          title: "Error",
          description: "Invalid product ID",
          variant: "destructive",
        });
        return;
      }
      
      const response = await getProductById(productId);
      const productData = extractData<Product>(response);
      
      if (productData) {
        setProduct(productData);
        // Set default size if available
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
      } else {
        const errorMessage = extractMessage(response) || "Failed to load product";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setProduct(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product. Please try again.",
        variant: "destructive",
      });
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const nextImage = () => {
    if (product?.images) {
      setSelectedImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      return;
    }

    if (!product) return;

    // Validate size selection if sizes are available
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size",
        variant: "destructive",
      });
      return;
    }

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

      // Prepare cart data with size
      const cartData = {
        userId: userId,
        productId: product.id,
        quantity: quantity,
        ...(selectedSize && { selectedSize: selectedSize }) // Include size if selected
      };

      const response = await addToCart(cartData);

      console.log('Add to cart response:', response);

      if (response && (response.success || !response.error)) {
        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ''} has been added to your cart`,
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

    // Validate size selection if sizes are available
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size",
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

  const images = product.images || [];
  const sizes = product.sizes || [];

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
          {/* Product Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full max-w-md mx-auto aspect-square overflow-hidden rounded-lg bg-muted border">
              <img
                src={
                  images[selectedImageIndex]
                    ? `https://gaushalaecommerce.runasp.net${images[selectedImageIndex]}`
                    : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'
                }
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                }}
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-80 hover:opacity-100"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-80 hover:opacity-100"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-primary ring-2 ring-primary ring-offset-2' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={
                        image
                          ? `https://gaushalaecommerce.runasp.net${image}`
                          : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'
                      }
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="flex items-center gap-3">
                <p className="text-3xl sm:text-4xl font-bold text-primary">
                  ₹ {Number(product.price).toFixed(2)}
                </p>
                {product.originalPrice && (
                  <>
                    <p className="text-xl text-muted-foreground line-through">
                      ₹ {Number(product.originalPrice).toFixed(2)}
                    </p>
                    <Badge variant="destructive" className="text-sm">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
              
              {/* Stock Status - Only show when stock is 0 or <= 10 */}
              {(product.stockQty === 0 || product.stockQty <= 10) && (
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    product.stockQty > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className={`text-sm ${
                    product.stockQty === 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {
                      product.stockQty === 0
                        ? 'Out of Stock'
                        : `Only ${product.stockQty} left in stock`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-3">
              {product.category && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">SKU</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
              )}
            </div>

            {/* Sizes Selector */}
            {sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Select Size</h3>
                  {selectedSize && (
                    <span className="text-sm text-muted-foreground">
                      Selected: <span className="font-medium">{selectedSize}</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      className={`h-10 px-4 ${
                        selectedSize === size 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stockQty > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-10 w-10"
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
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
              <p className="text-sm text-muted-foreground text-center">
                Please login to add items to cart
              </p>
            )}

            {/* Stock Warning - Only for items with 1-4 stock */}
            {product.stockQty > 0 && product.stockQty < 5 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Only {product.stockQty} item{product.stockQty > 1 ? 's' : ''} left! Order soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}