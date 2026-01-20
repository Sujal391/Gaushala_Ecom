"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  Search,
  Calendar,
  DollarSign,
  User,
  TrendingUp,
  Loader2,
  ShoppingBag,
  Filter,
  Edit,
  Save,
  X,
  TagIcon,
  Clock,
  Mail,
  Phone,
  MapPin,
  Home,
  Navigation,
  Building,
  Map,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getAllOrders, updateOrderStatus } from "../../../lib/api/auth";
import AdminGuard from "../../../components/guards/AdminGuard";
import { removeAuthToken } from "../../../lib/api/config";
import AdminLayout from "../../../components/layout/AdminLayout";

interface OrderItem {
  productId: number;
  productName: string;
  description?: string;
  quantity: number;
  productPrice: number;
  totalPrice: number;
  size?: string;
  images?: string[];
}

interface Customer {
  userId: number;
  name: string;
  email: string;
  mobileNo: string;
}

interface Address {
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
}

interface Order {
  orderId: number;
  userId?: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  isReferralDiscountApplied: boolean;
  discountSource?: string;
  offerCode?: string;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  customer: Customer;
  address: Address;
  items: OrderItem[];
}

// Valid statuses for the backend
const VALID_STATUSES = ['PLACED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'] as const;
type OrderStatus = typeof VALID_STATUSES[number];

// Status display mapping
const STATUS_DISPLAY_MAP: Record<string, string> = {
  'PLACED': 'Placed',
  'PACKED': 'Packed',
  'DISPATCHED': 'Dispatched',
  'DELIVERED': 'Delivered',
  'CANCELLED': 'Cancelled',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<{ [key: number]: OrderStatus }>({});
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, statusFilter, orders]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getAllOrders();
      console.log("Orders API response:", response);

      let ordersData: any[] = [];

      if (response?.success && response.data) {
        ordersData = response.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      } else if (response?.data) {
        ordersData = response.data;
      }

      console.log("Order statuses found:", 
        ordersData.slice(0, 5).map((o: any) => ({
          id: o.orderId,
          status: o.orderStatus,
          uppercase: o.orderStatus?.toUpperCase()
        }))
      );

      const mappedOrders: Order[] = ordersData.map((order: any) => ({
        orderId: order.orderId || order.id,
        userId: order.userId || order.customer?.userId,
        totalAmount: order.totalAmount || 0,
        discountAmount: order.discountAmount || 0,
        finalAmount: order.finalAmount || 0,
        isReferralDiscountApplied: order.isReferralDiscountApplied || false,
        discountSource: order.discountSource,
        offerCode: order.offerCode,
        paymentStatus: order.paymentStatus || 'Pending',
        orderStatus: order.orderStatus || 'PLACED',
        orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
        customer: order.customer || {
          userId: order.userId || 0,
          name: 'Unknown Customer',
          email: '',
          mobileNo: ''
        },
        address: order.address || {
          houseNo: '',
          street: '',
          landmark: '',
          city: '',
          state: '',
          pincode: '',
          fullAddress: 'Address not available'
        },
        items: order.items || [],
      }));

      const sortedOrders = mappedOrders.sort((a: Order, b: Order) => {
        const dateA = new Date(a.orderDate).getTime();
        const dateB = new Date(b.orderDate).getTime();
        return dateB - dateA;
      });

      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
      toast.success(`Loaded ${sortedOrders.length} orders`);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || "Failed to load orders. Please try again.");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId.toString().toLowerCase().includes(query) ||
          (order.userId && order.userId.toString().toLowerCase().includes(query)) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.email.toLowerCase().includes(query) ||
          order.customer.mobileNo.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (order) => order.orderStatus.toUpperCase() === statusFilter
      );
    }

    setFilteredOrders(filtered);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'PLACED': "bg-blue-100 text-blue-800 border-blue-200",
      'PACKED': "bg-purple-100 text-purple-800 border-purple-200",
      'CONFIRMED': "bg-purple-100 text-purple-800 border-purple-200",
      'DISPATCHED': "bg-yellow-100 text-yellow-800 border-yellow-200",
      'SHIPPED': "bg-yellow-100 text-yellow-800 border-yellow-200",
      'DELIVERED': "bg-green-100 text-green-800 border-green-200",
      'CANCELLED': "bg-red-100 text-red-800 border-red-200",
    };
    
    const statusUpper = status.toUpperCase();
    return (
      statusColors[statusUpper] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getPaymentStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'PAID': "bg-green-100 text-green-800 border-green-200",
      'PENDING': "bg-yellow-100 text-yellow-800 border-yellow-200",
      'FAILED': "bg-red-100 text-red-800 border-red-200",
      'REFUNDED': "bg-blue-100 text-blue-800 border-blue-200",
    };
    
    const statusUpper = status.toUpperCase();
    return (
      statusColors[statusUpper] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getStatusDisplay = (status: string): string => {
    const statusUpper = status.toUpperCase();
    return STATUS_DISPLAY_MAP[statusUpper] || status;
  };

  const handleUpdateStatus = async (orderId: number) => {
    const newStatus = selectedStatus[orderId];
    
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      toast.error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
      return;
    }

    setUpdatingStatus(orderId);
    try {
      console.log('Updating order status:', {
        orderId,
        status: newStatus
      });

      const res = await updateOrderStatus(orderId, newStatus);
      console.log('Update response:', res);

      if (res.success) {
        toast.success(res.message || "Order status updated successfully");
        
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId 
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
        
        setEditingOrder(null);
        setSelectedStatus(prev => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
      } else {
        toast.error(res.message || "Failed to update order status");
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          Object.keys(errorData.errors).forEach(key => {
            toast.error(`${key}: ${errorData.errors[key].join(', ')}`);
          });
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error("Failed to update order status");
        }
      } else {
        toast.error("Failed to update order status. Please check console.");
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  const startEditingStatus = (orderId: number, currentStatus: string) => {
    setEditingOrder(orderId);
    const statusUpper = currentStatus.toUpperCase() as OrderStatus;
    setSelectedStatus(prev => ({ ...prev, [orderId]: statusUpper }));
  };

  const cancelEditingStatus = (orderId: number) => {
    setEditingOrder(null);
    setSelectedStatus(prev => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.finalAmount, 0);
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.orderStatus.toUpperCase() === status)
      .length;
  };

  const getUniqueCustomers = () => {
    const customers = orders
      .map((order) => order.customer.userId)
      .filter((id) => id !== undefined);
    return new Set(customers).size;
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push("/shop");
  };

  const headerAction = (
    <Button
      variant="outline"
      size="sm"
      onClick={fetchOrders}
      className="gap-2"
    >
      <Loader2 className="h-4 w-4" />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
  );

  return (
    <AdminGuard>
      <AdminLayout title="Orders" headerAction={headerAction}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Total Orders
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {orders.length}
                      </p>
                    </div>
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Total Revenue
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        ₹ {getTotalRevenue().toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Customers
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {getUniqueCustomers()}
                      </p>
                    </div>
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Delivered
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {getOrdersByStatus("DELIVERED")}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by Order ID, Customer Name, Email, or Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="PLACED">Placed</SelectItem>
                        <SelectItem value="PACKED">Packed</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No orders found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Try adjusting your filters"
                    : "Orders will appear here once customers place them"}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.orderId} className="overflow-hidden">
                      <CardHeader className="bg-muted/50 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <CardTitle className="text-base sm:text-lg">
                                  Order #{order.orderId}
                                </CardTitle>
                                {order.customer && (
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      <User className="h-3 w-3 mr-1" />
                                      {order.customer.name}
                                    </Badge>
                                    {/* <Badge
                                      variant="outline"
                                      className={getPaymentStatusColor(order.paymentStatus)}
                                    >
                                      {order.paymentStatus}
                                    </Badge> */}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {formatDate(order.orderDate)}
                              </div>                              
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">  
                                <span>Payment Status: </span>
                                <Badge
                                  variant="outline"
                                  className={getPaymentStatusColor(order.paymentStatus)}
                                >
                                  {order.paymentStatus}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end gap-2">
                            {editingOrder === order.orderId ? (
                              <div className="flex items-center gap-2">
                                <Select
                                  value={selectedStatus[order.orderId] || order.orderStatus.toUpperCase()}
                                  onValueChange={(value: OrderStatus) => 
                                    setSelectedStatus(prev => ({ ...prev, [order.orderId]: value }))
                                  }
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {VALID_STATUSES.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {STATUS_DISPLAY_MAP[status] || status}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleUpdateStatus(order.orderId)}
                                  disabled={updatingStatus === order.orderId}
                                >
                                  {updatingStatus === order.orderId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => cancelEditingStatus(order.orderId)}
                                  disabled={updatingStatus === order.orderId}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(
                                    order.orderStatus
                                  )} font-semibold`}
                                >
                                  {getStatusDisplay(order.orderStatus)}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditingStatus(order.orderId, order.orderStatus)}
                                  disabled={updatingStatus === order.orderId}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <div className="flex flex-col items-end">
                              {order.discountAmount > 0 && (
                                <div className="text-xs text-muted-foreground line-through">
                                  ₹ {order.totalAmount.toFixed(2)}
                                </div>
                              )}
                              <div className="flex items-center gap-1 font-bold text-lg text-primary">
                                ₹ {order.finalAmount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-0">
                        <div className="p-4 border-b">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-sm">Customer Details</h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span className="font-medium">{order.customer.name}</span>
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{order.customer.email}</span>
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{order.customer.mobileNo}</span>
                                </div>
                                {order.customer.userId && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <div className="flex items-center gap-1">
                                      <Hash className="h-3 w-3" />
                                      <span>ID: {order.customer.userId}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {order.items && order.items.length > 0 && (
                              <div className="flex items-center gap-2">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleOrderExpansion(order.orderId)
                                  }
                                >
                                  {expandedOrder === order.orderId
                                    ? "Hide"
                                    : "View"}{" "}
                                  Details
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {expandedOrder === order.orderId && (
                          <div className="p-4 bg-muted/20">
                            {/* Address Section */}
                            <div className="mb-6 p-3 bg-white rounded-lg border">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-blue-500" />
                                <h4 className="font-semibold text-sm">Shipping Address</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Home className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">
                                      {order.address.houseNo}, {order.address.street}
                                    </span>
                                  </div>
                                  {order.address.landmark && (
                                    <div className="flex items-center gap-2">
                                      <Navigation className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm">
                                        {order.address.landmark}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Building className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">
                                      {order.address.city}, {order.address.state} - {order.address.pincode}
                                    </span>
                                  </div>
                                </div>
                                <div className="border-l pl-3">
                                  <div className="flex items-start gap-2">
                                    <Map className="h-3 w-3 text-muted-foreground mt-0.5" />
                                    <div className="text-sm text-muted-foreground">
                                      {order.address.fullAddress}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Order Items Section */}
                            {order.items && order.items.length > 0 && (
                              <>
                                <h4 className="font-semibold mb-3 text-sm">
                                  Order Items
                                </h4>
                                <div className="space-y-3">
                                  {order.items.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                          {item.images && item.images.length > 0 ? (
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
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-muted">
                                              <Package className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-medium text-sm truncate">
                                            {item.productName}
                                          </p>
                                          {item.description && (
                                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                                              {item.description}
                                            </p>
                                          )}
                                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span>ID: {item.productId}</span>
                                            {item.size && (
                                              <>
                                                <span>•</span>
                                                <span>Size: {item.size}</span>
                                              </>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            ₹{item.productPrice.toFixed(2)} ×{" "}
                                            {item.quantity}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="font-semibold text-sm flex-shrink-0">
                                        ₹{item.totalPrice.toFixed(2)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* Order Summary Section */}
                            <div className="mt-6 p-4 bg-white rounded-lg border space-y-3">
                              <h4 className="font-semibold text-sm mb-2">Order Summary</h4>
                              
                              {order.offerCode && (
                                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                                  <TagIcon className="h-3 w-3 text-yellow-600" />
                                  <span className="text-xs text-yellow-700">
                                    Applied {order.discountSource || 'Offer'}: {order.offerCode}
                                  </span>
                                </div>
                              )}

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Subtotal
                                  </span>
                                  <span className="font-medium">
                                    ₹{order.totalAmount.toFixed(2)}
                                  </span>
                                </div>

                                {order.discountAmount > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      Discount
                                    </span>
                                    <span className="font-medium text-green-600">
                                      -₹{order.discountAmount.toFixed(2)}
                                    </span>
                                  </div>
                                )}

                                {order.isReferralDiscountApplied && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      Referral Discount
                                    </span>
                                    <span className="font-medium text-green-600">
                                      Applied
                                    </span>
                                  </div>
                                )}

                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Shipping
                                  </span>
                                  <span className="font-medium text-green-600">
                                    Free
                                  </span>
                                </div>

                                <div className="pt-2 border-t">
                                  <div className="flex justify-between pt-2">
                                    <span className="font-semibold">
                                      Total Amount
                                    </span>
                                    <div className="text-right">
                                      {order.discountAmount > 0 && (
                                        <div className="text-xs text-muted-foreground line-through">
                                          ₹{order.totalAmount.toFixed(2)}
                                        </div>
                                      )}
                                      <span className="text-lg font-bold text-primary">
                                        ₹{order.finalAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Results Summary */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
              </>
            )}
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}