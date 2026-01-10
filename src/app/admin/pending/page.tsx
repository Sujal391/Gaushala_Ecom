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
  Loader2,
  Clock,
  Calendar,
  ShoppingBag,
  TagIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { removeAuthToken } from "../../../lib/api/config";
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  /* ===================== SIDEBAR ===================== */

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', active: true },
    { icon: Package, label: 'Products', href: '/admin/products', active: false },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders', active: false },
    { icon: Clock, label: 'Pending Orders', href: '/admin/pending', active: false },
    { icon: TagIcon, label: 'Offers', href: '/admin/offer', active: false },
    { icon: Users, label: 'Customers', href: '/admin/customers', active: false },
    { icon: Settings, label: 'Settings', href: '/admin/settings', active: false },
  ];

  const Sidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-card border-r flex flex-col h-full`}>
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
            variant={item.href === "/admin/pending" ? 'secondary' : 'ghost'}
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
          className="w-full justify-start gap-3 text-destructive"
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

  /* ===================== RENDER ===================== */

  return (
    <AdminGuard>
      <div className="min-h-screen flex bg-background">
        <aside className="hidden lg:block fixed h-full">
          <Sidebar />
        </aside>

        <div className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-30 bg-background border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[300px]">
                    <Sidebar isMobile />
                  </SheetContent>
                </Sheet>

                <h1 className="text-2xl font-bold">Pending Orders</h1>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {orders.length}
                </Badge>
              </div>

              <Button variant="outline" size="sm" onClick={fetchPendingOrders}>
                Refresh
              </Button>
            </div>
          </header>

          <main className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                Loading orders...
              </div>
            ) : (
              <>
                {/* Search + Date */}
                <Card className="mb-6">
                  <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by order ID, name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Popover
                      open={isDatePickerOpen}
                      onOpenChange={setIsDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(selectedDate, "MMM dd, yyyy")}
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

                    <Button variant="ghost" size="sm" onClick={clearDateFilter}>
                      Today
                    </Button>
                  </CardContent>
                </Card>

                {/* Table */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No pending orders found
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Final Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Order Date</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {filteredOrders.map((order) => (
                            <TableRow key={order.orderId}>
                              <TableCell className="font-medium">
                                #{order.orderId}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">
                                  {order.customer.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {order.customer.email}
                                </p>
                              </TableCell>
                              <TableCell>
                                {order.items.reduce(
                                  (sum, i) => sum + i.quantity,
                                  0
                                )}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(order.finalAmount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {order.orderStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {format(
                                  new Date(order.orderDate),
                                  "dd MMM yyyy, hh:mm a"
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
