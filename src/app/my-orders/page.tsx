"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Loader2, ShoppingBag, ArrowLeft, Calendar,
  DollarSign, XCircle, CheckCircle, MessageSquare, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import UserLayout from '../../components/layout/UserLayout';
import UserGuard from '../../components/guards/UserGuard';
import { getMyOrders, cancelMyOrder } from '../../lib/api/auth';
import { submitFeedback } from '../../lib/api/auth'; // You'll need to create this
import { isAuthenticated, getUserId } from '../../lib/api/config';
import OrderStatusAnimation from '../../components/OrderStatusAnimation';
import { toast } from 'sonner';

interface OrderItem {
  productId: number;
  productName: string;
  description?: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  images?: string[];
  hasFeedback?: boolean; // Add this to track if feedback already given
}

interface Order {
  orderId: number;
  totalAmount: number;
  orderStatus: string;
  orderDate: string;
  items: OrderItem[];
  finalAmount: number;
}

interface FeedbackFormData {
  orderId: number;
  productId: number;
  rating: number;
  review: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [cancellingOrder, setCancellingOrder] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<{
    orderId: number;
    orderNumber: string;
  } | null>(null);
  
  // Feedback states
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    orderId: number;
    productId: number;
    productName: string;
    image?: string;
  } | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    orderId: 0,
    productId: 0,
    rating: 5,
    review: '',
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to view your orders');
      router.push('/shop');
      return;
    }

    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userId = getUserId();

      if (!userId) {
        toast.error('User not found. Please login again.');
        router.push('/shop');
        return;
      }

      const response = await getMyOrders(userId);
      console.log('Orders API response:', response);

      // Handle different response structures
      let ordersData = [];
      
      if (response && response.success && response.data) {
        ordersData = response.data;
      } else if (response && Array.isArray(response)) {
        ordersData = response;
      } else if (response && response.data) {
        ordersData = response.data;
      }

      // Sort by orderDate (latest first)
      const sortedOrders = ordersData.sort((a: Order, b: Order) => {
        const dateA = new Date(a.orderDate).getTime();
        const dateB = new Date(b.orderDate).getTime();
        return dateB - dateA;
      });
      
      console.log('Mapped orders:', sortedOrders);
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Feedback functions
  const openFeedbackDialog = (orderId: number, productId: number, productName: string, image?: string) => {
    setSelectedProduct({
      orderId,
      productId,
      productName,
      image,
    });
    setFeedbackForm({
      orderId,
      productId,
      rating: 5,
      review: '',
    });
    setShowFeedbackDialog(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackForm.review.trim()) {
      toast.error('Please write your review');
      return;
    }

    if (feedbackForm.review.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    try {
      setSubmittingFeedback(true);
      const response = await submitFeedback(feedbackForm);

      if (response.success) {
        toast.success('Thank you for your feedback!');
        
        // Update the order item to mark feedback as submitted
        setOrders(prevOrders =>
          prevOrders.map(order => {
            if (order.orderId === feedbackForm.orderId) {
              return {
                ...order,
                items: order.items.map(item =>
                  item.productId === feedbackForm.productId
                    ? { ...item, hasFeedback: true }
                    : item
                ),
              };
            }
            return order;
          })
        );
        
        setShowFeedbackDialog(false);
        setSelectedProduct(null);
        setFeedbackForm({
          orderId: 0,
          productId: 0,
          rating: 5,
          review: '',
        });
      } else {
        toast.error(response.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const isFeedbackEligible = (orderStatus: string) => {
    const normalizedStatus = orderStatus.toUpperCase();
    // Only allow feedback for delivered orders
    return normalizedStatus === 'DELIVERED';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    const statusColors: { [key: string]: string } = {
      'PLACED': 'bg-blue-100 text-blue-800 border-blue-200',
      'CONFIRMED': 'bg-purple-100 text-purple-800 border-purple-200',
      'SHIPPED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
      'PROCESSING': 'bg-orange-100 text-orange-800 border-orange-200',
      'OUT_FOR_DELIVERY': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return statusColors[normalizedStatus] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const isCancellable = (orderStatus: string) => {
    const normalizedStatus = orderStatus.toUpperCase();
    // Only allow cancellation for orders that are PLACED or PROCESSING
    return ['PLACED', 'PROCESSING', 'CONFIRMED'].includes(normalizedStatus);
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getProductImage = (images?: string[]) => {
    if (images && images.length > 0) {
      return images[0];
    }
    return '/placeholder-product.jpg';
  };

  const handleCancelClick = (orderId: number) => {
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      setOrderToCancel({
        orderId,
        orderNumber: `#${orderId}`
      });
      setShowCancelDialog(true);
    }
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setCancellingOrder(orderToCancel.orderId);
      const userId = getUserId();
      
      if (!userId) {
        toast.error('User not found. Please login again.');
        return;
      }

      const response = await cancelMyOrder(orderToCancel.orderId, userId);
      
      if (response.success) {
        toast.success('Order cancelled successfully');
        
        // Update the order status locally
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.orderId === orderToCancel.orderId
              ? { ...order, orderStatus: 'CANCELLED' }
              : order
          )
        );
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrder(null);
      setOrderToCancel(null);
      setShowCancelDialog(false);
    }
  };

  const getOrderStatusMessage = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'PLACED':
        return 'Order has been placed successfully.';
      case 'PACKED':
        return 'Order has been packed and is ready for dispatch.';
      case 'DISPATCHED':
        return 'Order has been dispatched.';
      case 'DELIVERED':
        return 'Order has been delivered.';
      case 'CANCELLED':
        return 'Order has been cancelled.';
      default:
        return `Order is ${status.toLowerCase()}`;
    }
  };

  // Star rating component
  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setFeedbackForm(prev => ({ ...prev, rating: i }))}
          className="focus:outline-none"
        >
          <Star
            className={`h-8 w-8 ${
              i <= feedbackForm.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          />
        </button>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <UserGuard>
        <UserLayout>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your orders...</p>
            </div>
          </div>
        </UserLayout>
      </UserGuard>
    );
  }

  return (
    <UserGuard>
      <UserLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/shop')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Button onClick={() => router.push('/shop')}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.orderId} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Order #{order.orderId}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.orderDate)}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(order.orderStatus)} font-semibold`}
                      >
                        {order.orderStatus.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1 font-bold text-lg text-primary">
                        ₹ {order.finalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} in this order
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <OrderStatusAnimation status={order.orderStatus} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleOrderExpansion(order.orderId)}
                        >
                          {expandedOrder === order.orderId ? 'Hide Details' : 'View Details'}
                        </Button>
                        {isCancellable(order.orderStatus) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelClick(order.orderId)}
                            disabled={cancellingOrder === order.orderId}
                          >
                            {cancellingOrder === order.orderId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Cancel Order'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.orderId && (
                    <div className="p-4 bg-muted/20">
                      <h4 className="font-semibold mb-3 text-sm">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                <img
                                  src={imageErrors.has(item.productId) 
                                    ? '/placeholder-product.jpg'
                                    : (item.images?.[0] 
                                      ? `http://gaushalaecommerce.runasp.net${item.images[0]}`
                                      : '/placeholder-product.jpg')
                                  }
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                  onError={() => {
                                    setImageErrors(prev => new Set(prev).add(item.productId));
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.productName} - {item.size}</p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  ₹{item.productPrice.toFixed(2)} × {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">
                                ₹{item.totalPrice.toFixed(2)}
                              </p>
                              {isFeedbackEligible(order.orderStatus) && !item.hasFeedback && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openFeedbackDialog(
                                    order.orderId,
                                    item.productId,
                                    item.productName,
                                    item.images?.[0]
                                  )}
                                  className="gap-1"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  Feedback
                                </Button>
                              )}
                              {item.hasFeedback && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Reviewed
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">
                            ₹{order.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                          </span>
                        </div>
                        {/* <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="font-medium">
                            ₹{order.taxAmount.toFixed(2)}
                          </span>
                        </div> */}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-medium text-green-600">Free</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-semibold">Total</span>
                          <span className="text-lg font-bold text-primary">
                            ₹{order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/shop')}
            >
              Continue Shopping
          </Button>
          </div>
        )}

        {/* Cancel Order Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order {orderToCancel?.orderNumber}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone.
                Any payment will be refunded according to the refund policy.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancellingOrder !== null}>
                Keep Order
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancelOrder}
                disabled={cancellingOrder !== null}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {cancellingOrder !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Order'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Feedback Dialog */}
        <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Leave Feedback</DialogTitle>
              <DialogDescription>
                Share your experience with this product from order #{selectedProduct?.orderId}
              </DialogDescription>
            </DialogHeader>
            
            {selectedProduct && (
              <div className="space-y-6 py-4">
                {/* Product Info */}
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={
                        selectedProduct.image
                          ? `http://gaushalaecommerce.runasp.net${selectedProduct.image}`
                          : '/placeholder-product.jpg'
                      }
                      alt={selectedProduct.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedProduct.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Order #{selectedProduct.orderId}
                    </p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="space-y-3">
                  <Label>Rating</Label>
                  <div className="flex items-center gap-2">
                    {renderStarRating()}
                    <span className="ml-2 text-sm font-medium">
                      {feedbackForm.rating} out of 5
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <div className="space-y-3">
                  <Label htmlFor="review">Your Review</Label>
                  <Textarea
                    id="review"
                    placeholder="Share your thoughts about this product..."
                    value={feedbackForm.review}
                    onChange={(e) => setFeedbackForm(prev => ({
                      ...prev,
                      review: e.target.value
                    }))}
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 10 characters required
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
                disabled={submittingFeedback}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback || feedbackForm.review.trim().length < 10}
              >
                {submittingFeedback ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
    </UserGuard>
  );
}