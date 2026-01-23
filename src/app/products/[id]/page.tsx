"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Loader2, ShoppingCart, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '../../../hooks/useToast';
import UserLayout from '../../../components/layout/UserLayout';
import { getProductById, addToCart, extractData, extractMessage, getFeedbackByProduct } from '../../../lib/api/auth';
import { isAuthenticated, getUserId } from '../../../lib/api/config';
import { useCart } from '../../../context/CartContext';
import type { Product } from '../../../types/index';
import UserGuard from '../../../components/guards/UserGuard'

interface Feedback {
  id: number;
  userId: number;
  userName?: string;
  customerName?: string;
  productId: number;
  rating: number;
  comment: string;
  review?: string;
  createdAt: string;
}

interface FeedbackData {
  averageRating: number;
  totalReviews: number;
  feedbacks: Feedback[];
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { incrementCartCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    averageRating: 0,
    totalReviews: 0,
    feedbacks: []
  });
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      let productId: string | null = null;
      
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
      
      const response = await getProductById(Number(productId));
      const productData = extractData<Product>(response);
      
      if (productData) {
        setProduct(productData);
        // Set default size if available
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        // Fetch feedback after product is loaded
        fetchFeedback(Number(productId));
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

  const fetchFeedback = async (productId: number) => {
    try {
      setLoadingFeedback(true);
      
      const response = await getFeedbackByProduct(productId);
      
      // Initialize with default empty data
      let processedData: FeedbackData = {
        averageRating: 0,
        totalReviews: 0,
        feedbacks: []
      };

      // Handle different response structures
      if (response && response.success && response.data && Array.isArray(response.data)) {
        const feedbackItems = response.data;
        
        // Map the API response to our Feedback interface
        const feedbacks: Feedback[] = feedbackItems.map((item: any, index: number) => ({
          id: item.id || index + 1,
          userId: item.userId || 0,
          userName: item.customerName || item.userName || `Customer ${index + 1}`,
          customerName: item.customerName,
          productId: item.productId || productId,
          rating: item.rating || 0,
          comment: item.review || item.comment || '',
          review: item.review,
          createdAt: item.createdAt || new Date().toISOString()
        }));

        // Calculate average rating
        const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
        const averageRating = feedbacks.length > 0 ? totalRating / feedbacks.length : 0;

        processedData = {
          averageRating,
          totalReviews: feedbacks.length,
          feedbacks
        };
      }
      
      setFeedbackData(processedData);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      // Keep default empty data on error
      setFeedbackData({
        averageRating: 0,
        totalReviews: 0,
        feedbacks: []
      });
    } finally {
      setLoadingFeedback(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    const roundedRating = Math.round(rating);
    
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= roundedRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
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
        ...(selectedSize && { selectedSize: selectedSize })
      };

      const response = await addToCart(cartData);

      if (response && (response.success || !response.error)) {
        // Update cart count in global state
        incrementCartCount(quantity);

        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ''} has been added to your cart`,
        });

        // Reset quantity after successful add
        setQuantity(1);
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
      <UserGuard>
      <UserLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </UserLayout>
      </UserGuard>
    );
  }

  if (!product) {
    return (
      <UserGuard>
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
      </UserGuard>
    );
  }

  const images = product.images || [];
  const sizes = product.sizes || [];
  const hasReviews = feedbackData.totalReviews > 0;

  return (
    <UserGuard>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full max-w-full sm:max-w-md mx-auto aspect-square overflow-hidden rounded-lg bg-muted border">
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
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight">
                {product.name}
              </h1>
              
              {/* Price */}
              <div className="flex items-center justify-between gap-3">
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

              {/* Rating and Reviews */}
              {hasReviews && (
                <div className="flex items-center gap-3 pt-1">
                  {renderStars(feedbackData.averageRating, 'lg')}
                  <span className="text-lg font-semibold">
                    {feedbackData.averageRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({feedbackData.totalReviews} {feedbackData.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
              
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
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      className={`h-11 px-5 rounded-lg ${
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
                <div className="flex items-center gap-4 mt-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-11 w-11 rounded-md"
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
                    className="h-11 w-11 rounded-md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Buttons */}
            <div className="flex flex-row gap-3 pt-4">
              <Button
                size="lg"
                className="flex-1 rounded-full"
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
                className="flex-1 rounded-full"
                disabled={product.stockQty === 0 || addingToCart}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>
            
            {/* Description */}
            {product.description && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

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

        {/* IMPROVED Customer Reviews Section */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            
            {hasReviews && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                <span className="font-semibold text-foreground">{feedbackData.totalReviews}</span>
                <span>{feedbackData.totalReviews === 1 ? 'Review' : 'Reviews'}</span>
              </div>
            )}
          </div>
          
          {loadingFeedback ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <span className="text-muted-foreground">Loading reviews...</span>
            </div>
          ) : hasReviews ? (
            <div className="space-y-6">
              {feedbackData.feedbacks.map((feedback) => (
                <div key={feedback.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {renderStars(feedback.rating, 'sm')}
                          <span className="font-semibold text-lg ml-1">{feedback.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">
                          {feedback.userName || feedback.customerName || `Customer ${feedback.id}`}
                        </span>
                        <span className="text-sm text-muted-foreground ml-3">
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-foreground leading-relaxed">
                      {feedback.comment || feedback.review || 'No comment provided'}
                    </p>
                  </div>
                  
                  {/* Verified Purchase Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified Purchase
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Be the first to share your thoughts about this product! Your review will help other customers.
              </p>
            </div>
          )}
          
          {/* Show helpful message when there are reviews */}
          {hasReviews && feedbackData.totalReviews >= 3 && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-muted-foreground">
                Showing all {feedbackData.totalReviews} reviews
              </p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
    </UserGuard>
  );
}