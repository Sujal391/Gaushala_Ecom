"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Clock,
  Calendar,
  Package,
  DollarSign,
  User,
  X,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import { toast } from "sonner";
import AdminGuard from "../../../components/guards/AdminGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { getPendingOrders } from "../../../lib/api/auth";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";

/* ===================== TYPES ===================== */

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
}

interface Customer {
  userId: number;
  name: string;
  email: string;
  mobileNo: string;
}

interface PendingOrder {
  orderId: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  orderStatus: string;
  orderDate: string;
  customer: Customer;
  items: OrderItem[];
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

/* ===================== PAGE ===================== */

export default function AdminPendingOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Separate state for applied filters and temporary filters
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  
  const [tempDateRange, setTempDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Load last 7 days data by default on initial load
  useEffect(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    const today = new Date();
    
    setAppliedDateRange({
      from: sevenDaysAgo,
      to: today,
    });
    
    setTempDateRange({
      from: sevenDaysAgo,
      to: today,
    });
  }, []);

  // Fetch data when appliedDateRange changes
  useEffect(() => {
    if (appliedDateRange.from && appliedDateRange.to) {
      fetchPendingOrders();
    }
  }, [appliedDateRange]);

  // Filter orders based on search query
  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders]);

  /* ===================== API ===================== */

  const fetchPendingOrders = async () => {
    if (!appliedDateRange.from || !appliedDateRange.to) {
      toast.error("Please select a date range");
      return;
    }

    setIsLoading(true);
    try {
      const params: any = {};
      
      // Format dates to yyyy-MM-dd format as required by the API
      params.startDate = format(appliedDateRange.from, "yyyy-MM-dd");
      params.endDate = format(appliedDateRange.to, "yyyy-MM-dd");

      const response = await getPendingOrders(params);

      if (response?.success && response.data) {
        const sorted = response.data.sort(
          (a, b) =>
            new Date(b.orderDate).getTime() -
            new Date(a.orderDate).getTime()
        );

        setOrders(sorted);
        setFilteredOrders(sorted);
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load pending orders");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== FILTER ===================== */

  const filterOrders = () => {
    if (!searchQuery) {
      setFilteredOrders(orders);
      return;
    }

    const query = searchQuery.toLowerCase();

    setFilteredOrders(
      orders.filter(
        (o) =>
          o.orderId.toString().includes(query) ||
          o.customer.name.toLowerCase().includes(query) ||
          o.customer.email.toLowerCase().includes(query) ||
          o.customer.mobileNo.includes(query)
      )
    );
  };

  const handleTempDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setTempDateRange(range);
    }
  };

  const applyDateFilter = () => {
    if (!tempDateRange.from || !tempDateRange.to) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    setAppliedDateRange(tempDateRange);
    setIsDatePickerOpen(false);
  };

  const applyQuickFilter = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    
    setTempDateRange({ from: start, to: end });
    setAppliedDateRange({ from: start, to: end });
  };

  const clearDateFilter = () => {
    const sevenDaysAgo = subDays(new Date(), 7);
    const today = new Date();
    
    setTempDateRange({ from: sevenDaysAgo, to: today });
    setAppliedDateRange({ from: sevenDaysAgo, to: today });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    const sevenDaysAgo = subDays(new Date(), 7);
    const today = new Date();
    
    setTempDateRange({ from: sevenDaysAgo, to: today });
    setAppliedDateRange({ from: sevenDaysAgo, to: today });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
    } catch {
      return dateString;
    }
  };

  const formatDateRangeDisplay = (range: DateRange) => {
    if (!range.from || !range.to) {
      return "Select date range";
    }
    
    if (format(range.from, "yyyy-MM-dd") === format(range.to, "yyyy-MM-dd")) {
      return format(range.from, "MMM dd, yyyy");
    }
    
    return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd, yyyy")}`;
  };

  const getTotalPendingAmount = () => {
    return orders.reduce((sum, order) => sum + order.finalAmount, 0);
  };

  const getTotalItems = () => {
    return orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  };

  const getUniqueCustomers = () => {
    const customerIds = orders.map(order => order.customer.userId);
    return new Set(customerIds).size;
  };

  const hasActiveFilters = searchQuery || 
    (appliedDateRange.from && appliedDateRange.to && 
     (format(appliedDateRange.from, "yyyy-MM-dd") !== format(subDays(new Date(), 7), "yyyy-MM-dd") || 
      format(appliedDateRange.to, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd")));

  const headerAction = (
    <div className="flex gap-2">
      {hasActiveFilters && (
        <Button 
          onClick={clearAllFilters} 
          variant="ghost" 
          size="sm"
          className="gap-2"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Clear Filters</span>
        </Button>
      )}
      <Button 
        onClick={fetchPendingOrders} 
        variant="outline" 
        size="sm"
        className="gap-2"
      >
        <Loader2 className="h-4 w-4" />
        <span className="hidden sm:inline">Refresh</span>
      </Button>
    </div>
  );

  /* ===================== RENDER ===================== */

  return (
    <AdminGuard>
      <AdminLayout title="Pending Orders" headerAction={headerAction}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading pending orders...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Pending Orders
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {orders.length}
                      </p>
                    </div>
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Pending Amount
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        ₹ {getTotalPendingAmount().toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Total Items
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {getTotalItems()}
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
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-6">
                  {/* Quick Date Filters */}
                  <div>
                    <p className="text-sm font-medium mb-2 text-muted-foreground">
                      Quick Filters
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyQuickFilter(0)}
                        className={appliedDateRange.from && appliedDateRange.to && 
                          format(appliedDateRange.from, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? 
                          "bg-primary/10 border-primary" : ""
                        }
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyQuickFilter(7)}
                        className={appliedDateRange.from && appliedDateRange.to && 
                          format(appliedDateRange.from, "yyyy-MM-dd") === format(subDays(new Date(), 7), "yyyy-MM-dd") ? 
                          "bg-primary/10 border-primary" : ""
                        }
                      >
                        Last 7 days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyQuickFilter(30)}
                        className={appliedDateRange.from && appliedDateRange.to && 
                          format(appliedDateRange.from, "yyyy-MM-dd") === format(subDays(new Date(), 30), "yyyy-MM-dd") ? 
                          "bg-primary/10 border-primary" : ""
                        }
                      >
                        Last 30 days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const start = startOfMonth(new Date());
                          const end = endOfMonth(new Date());
                          setTempDateRange({ from: start, to: end });
                          setAppliedDateRange({ from: start, to: end });
                        }}
                      >
                        This Month
                      </Button>
                    </div>
                  </div>

                  {/* Search and Date Range */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by order ID, name, email or phone"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        {searchQuery && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setSearchQuery("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Popover
                        open={isDatePickerOpen}
                        onOpenChange={setIsDatePickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="gap-2 w-full sm:w-auto">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateRangeDisplay(tempDateRange)}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <div className="p-3 border-b">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium">Select Date Range</p>
                              <Button
                                size="sm"
                                onClick={applyDateFilter}
                                disabled={!tempDateRange.from || !tempDateRange.to}
                              >
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                              </Button>
                            </div>
                          </div>
                          <CalendarComponent
                            mode="range"
                            selected={tempDateRange}
                            onSelect={handleTempDateRangeSelect}
                            numberOfMonths={2}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearDateFilter}
                        className="hidden sm:inline-flex"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No pending orders found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || (appliedDateRange.from && appliedDateRange.to) 
                    ? "Try adjusting your filters" 
                    : "All orders are processed"}
                </p>
              </div>
            ) : (
              <>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                            <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Items</TableHead>
                            <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden md:table-cell">Status</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Order Date</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {filteredOrders.map((order) => (
                            <TableRow 
                              key={order.orderId} 
                              className="hover:bg-muted/30 cursor-pointer"
                              onClick={() => router.push('/admin/orders')}
                            >
                              <TableCell className="font-medium text-xs sm:text-sm">
                                #{order.orderId}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                <div className="font-medium">{order.customer.name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {order.customer.email}
                                </div>
                                <div className="text-xs text-muted-foreground sm:hidden">
                                  {order.customer.mobileNo}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                                {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                              </TableCell>
                              <TableCell className="font-semibold text-xs sm:text-sm">
                                ₹ {order.finalAmount.toFixed(2)}
                                <div className="text-xs text-muted-foreground sm:hidden">
                                  Items: {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  {order.orderStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                                {formatDate(order.orderDate)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Showing {filteredOrders.length} of {orders.length} pending orders
                  {appliedDateRange.from && appliedDateRange.to && (
                    <span className="block sm:inline sm:ml-2">
                      from {format(appliedDateRange.from, "MMM dd, yyyy")} to {format(appliedDateRange.to, "MMM dd, yyyy")}
                    </span>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}