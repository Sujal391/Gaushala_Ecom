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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { getAllOrders, updateOrderStatus } from "../../../lib/api/auth";
import AdminGuard from "../../../components/guards/AdminGuard";
import { removeAuthToken } from "../../../lib/api/config";

interface OrderItem {
  productId: number;
  productName: string;
  description?: string;
  quantity: number;
  productPrice: number;
  totalPrice: number;
  images?: string[];
}

interface Customer {
  userId: number;
  name: string;
  email: string;
  mobileNo: string;
}

interface Order {
  orderId: number;
  userId?: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  isReferralDiscountApplied: boolean;
  orderStatus: string;
  orderDate: string;
  customer: Customer; // Add this
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

      // Log status values for debugging
      console.log("Order statuses found:", 
        ordersData.slice(0, 5).map((o: any) => ({
          id: o.orderId,
          status: o.orderStatus,
          uppercase: o.orderStatus?.toUpperCase()
        }))
      );

      const mappedOrders: Order[] = ordersData.map((order: any) => ({
        orderId: order.orderId || order.id,
        userId: order.userId,
        totalAmount: order.totalAmount || 0,
        discountAmount: order.discountAmount || 0,
        finalAmount: order.finalAmount || 0,
        isReferralDiscountApplied: order.isReferralDiscountApplied || false,
        orderStatus: order.orderStatus || 'PLACED',
        orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
        customer: order.customer || { // Add this mapping
          userId: order.userId || 0,
          name: 'Unknown Customer',
          email: '',
          mobileNo: ''
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
          (order.userId && order.userId.toString().toLowerCase().includes(query))
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

    // Validate status
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
        
        // Update the order in local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId 
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
        
        // Exit edit mode
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
      
      // Detailed error handling
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
    // Convert to uppercase for backend
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
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.orderStatus.toUpperCase() === status)
      .length;
  };

  const getUniqueCustomers = () => {
    const customers = orders
      .map((order) => order.userId)
      .filter((id) => id !== undefined);
    return new Set(customers).size;
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Clock, label: 'Pending Orders', href: '/admin/pending' },
    { icon: TagIcon, label: 'Offers', href: '/admin/offer' },
    { icon: Users, label: "Customers", href: "/admin/customers" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const Sidebar = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile ? "w-full" : "w-64"
      } bg-card border-r flex flex-col h-full`}
    >
      <div className="p-4 sm:p-6 border-b">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <span className="text-xl sm:text-2xl font-bold">StyleHub Admin</span>
        </div>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant={item.href === "/admin/orders" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 text-sm sm:text-base py-2 sm:py-3 h-auto"
            onClick={() => {
              router.push(item.href);
              if (isMobile) setIsSidebarOpen(false);
            }}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-3 sm:p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm sm:text-base text-destructive hover:text-destructive hover:bg-destructive/10 py-2 sm:py-3 h-auto"
          onClick={() => {
            removeAuthToken();
            router.push("/shop");
          }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 h-full z-40">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="p-0 w-[280px] sm:w-[320px]"
                  >
                    <Sidebar isMobile={true} />
                  </SheetContent>
                </Sheet>

                <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchOrders}
                  className="gap-2"
                >
                  <Loader2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-4 sm:p-6 lg:p-8">
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
                            placeholder="Search by Order ID or User ID..."
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
                                <div className="space-y-1">
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
                                        <div className="text-xs text-muted-foreground hidden sm:block">
                                          {order.customer.email}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(order.orderDate)}
                                    {order.customer && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <span>{order.customer.mobileNo}</span>
                                      </>
                                    )}
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
                                <div className="flex items-center gap-1 font-bold text-lg text-primary">
                                  ₹ {order.totalAmount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="p-0">
                            <div className="p-4 border-b">
                              <div className="flex items-center justify-between">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {order.items && order.items.length > 0
                                    ? `${order.items.length} item${
                                        order.items.length !== 1 ? "s" : ""
                                      } in this order`
                                    : "Order details not available"}
                                </p>
                                {order.items && order.items.length > 0 && (
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
                                )}
                              </div>
                            </div>

                            {expandedOrder === order.orderId &&
                              order.items &&
                              order.items.length > 0 && (
                                <div className="p-4 bg-muted/20">
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
                                            <p className="text-xs text-muted-foreground">
                                              ID: {item.productId}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
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

                                  <div className="mt-4 pt-4 border-t space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Subtotal
                                      </span>
                                      <span className="font-medium">
                                        ₹
                                        {order.items
                                          .reduce(
                                            (sum, item) => sum + item.totalPrice,
                                            0
                                          )
                                          .toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Tax
                                      </span>
                                      <span className="font-medium">
                                        Included
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Shipping
                                      </span>
                                      <span className="font-medium text-green-600">
                                        Free
                                      </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                      <span className="font-semibold">
                                        Total
                                      </span>
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

                    {/* Results Summary */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                      Showing {filteredOrders.length} of {orders.length} orders
                    </div>
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}