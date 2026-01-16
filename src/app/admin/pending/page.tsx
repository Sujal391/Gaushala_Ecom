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
import { format } from "date-fns";

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

/* ===================== PAGE ===================== */

export default function AdminPendingOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
  }, [selectedDate]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders]);

  /* ===================== API ===================== */

  const fetchPendingOrders = async () => {
    setIsLoading(true);
    try {
      const params = {
        date: format(selectedDate, "yyyy-MM-dd"),
      };

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
          o.customer.email.toLowerCase().includes(query)
      )
    );
  };

  const clearDateFilter = () => {
    setSelectedDate(new Date());
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

  const headerAction = (
    <Button 
      onClick={fetchPendingOrders} 
      variant="outline" 
      size="sm"
      className="gap-2"
    >
      <Loader2 className="h-4 w-4" />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by order ID, name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
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
                          <span className="hidden sm:inline">
                            {format(selectedDate, "MMM dd, yyyy")}
                          </span>
                          <span className="sm:hidden">
                            {format(selectedDate, "MMM dd")}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) setSelectedDate(date);
                            setIsDatePickerOpen(false);
                          }}
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
                      Today
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearDateFilter}
                      className="sm:hidden"
                    >
                      Reset
                    </Button>
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
                  {searchQuery || selectedDate 
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
                </div>
              </>
            )}
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}