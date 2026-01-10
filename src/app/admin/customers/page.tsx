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
  UserCheck,
  UserX,
  Calendar,
  ShoppingBag,
  TagIcon,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

import { toast } from "sonner";
import AdminGuard from "../../../components/guards/AdminGuard";
import { removeAuthToken } from "../../../lib/api/config";
import { getAdminCustomers, updateCustomerStatus } from "../../../lib/api/auth";

interface Customer {
  id: number;
  name: string;
  email: string;
  mobileNo: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminCustomers();
      console.log("Customers API response:", response);

      let data: Customer[] = [];

      if (response?.success && response.data) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setCustomers(sorted);
      setFilteredCustomers(sorted);
      toast.success(`Loaded ${sorted.length} customers`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load customers");
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredCustomers(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.mobileNo.includes(query) ||
          c.id.toString().includes(query)
      )
    );
  };

  const handleStatusToggle = async (customerId: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      // Optimistically update UI
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, isActive: newStatus } : c
        )
      );
      
      await updateCustomerStatus(customerId, newStatus);
      
      toast.success(
        `Customer ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error(error);
      // Revert on error
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, isActive: currentStatus } : c
        )
      );
      toast.error("Failed to update customer status");
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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
            variant={item.href === "/admin/customers" ? 'secondary' : 'ghost'}
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

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 h-full z-40">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[300px]">
                    <Sidebar isMobile />
                  </SheetContent>
                </Sheet>

                <h1 className="text-2xl font-bold">Customers</h1>
              </div>

              <Button onClick={fetchCustomers} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                Loading customers...
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-6 flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Customers
                        </p>
                        <p className="text-2xl font-bold">
                          {customers.length}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Active
                        </p>
                        <p className="text-2xl font-bold">
                          {customers.filter((c) => c.isActive).length}
                        </p>
                      </div>
                      <UserCheck className="h-8 w-8 text-green-500" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Inactive
                        </p>
                        <p className="text-2xl font-bold">
                          {customers.filter((c) => !c.isActive).length}
                        </p>
                      </div>
                      <UserX className="h-8 w-8 text-red-500" />
                    </CardContent>
                  </Card>
                </div>

                {/* Search */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, phone or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Customers Table */}
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No customers found
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Mobile</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {filteredCustomers.map((c) => (
                              <TableRow key={c.id}>
                                <TableCell className="font-medium">
                                  #{c.id}
                                </TableCell>
                                <TableCell>{c.name}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {c.email}
                                </TableCell>
                                <TableCell>{c.mobileNo}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {formatDate(c.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Switch
                                    checked={c.isActive}
                                    onCheckedChange={() => handleStatusToggle(c.id, c.isActive)}
                                    className={`${
                                      c.isActive 
                                        ? "data-[state=checked]:bg-green-500" 
                                        : "data-[state=unchecked]:bg-red-600"
                                    }`}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Showing {filteredCustomers.length} of {customers.length} customers
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}