"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  Plus,
  DollarSign,
  ShoppingBag,
  Loader2,
  TagIcon,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import AdminGuard from '../../components/guards/AdminGuard';
import { removeAuthToken } from '../../lib/api/config';
import { getDashboardStats } from '../../lib/api/auth';
import AdminLayout from '../../components/layout/AdminLayout';

interface RecentOrder {
  orderId: number;
  userId: number;
  finalAmount: number;
  orderStatus: string;
  orderDate: string;
  customerName: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  recentOrders: RecentOrder[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalRevenue: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    recentOrders: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      console.log('Dashboard data response:', response);

      // Handle different response formats
      if (response && response.success && response.data) {
        setDashboardData(response.data);
      } else if (response && 'totalRevenue' in response) {
        setDashboardData(response as DashboardStats);
      } else if (response) {
        // Fallback for direct data
        setDashboardData(response);
      }
      
      toast.success('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push('/shop');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-800';
      case 'PLACED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹ ${dashboardData.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Total Products',
      value: dashboardData.totalProducts.toString(),
      icon: Package,
      bgColor: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: dashboardData.totalOrders.toString(),
      icon: ShoppingCart,
      bgColor: 'bg-purple-500',
    },
    {
      title: 'Total Customers',
      value: dashboardData.totalCustomers.toString(),
      icon: Users,
      bgColor: 'bg-orange-500',
    },
  ];

  const headerAction = (
    <div className="flex items-center gap-2">
      <Button 
        onClick={loadDashboardData} 
        variant="outline" 
        size="sm"
        className="gap-2"
      >
        <Loader2 className="h-4 w-4" />
        <span className="hidden sm:inline">Refresh</span>
      </Button>
      <Button onClick={() => router.push('/admin/products/add')} className="gap-2">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Product</span>
        <span className="sm:hidden">Add</span>
      </Button>
    </div>
  );

  return (
    <AdminGuard>
      <AdminLayout title="Dashboard" headerAction={headerAction}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {stats.map((stat) => (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg`}>
                        <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="mb-6 sm:mb-8">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/admin/orders')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {dashboardData.recentOrders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent orders</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium">Order ID</th>
                          <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium">Customer Name</th>
                          <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium">Amount</th>
                          <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium">Status</th>
                          <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium hidden md:table-cell">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {dashboardData.recentOrders.map((order) => (
                          <tr 
                            key={order.orderId} 
                            className="hover:bg-muted/30 transition cursor-pointer"
                            onClick={() => router.push('/admin/orders')}
                          >
                            <td className="p-3 sm:p-4 font-medium text-xs sm:text-sm">#{order.orderId}</td>
                            <td className="p-3 sm:p-4 text-xs sm:text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {order.customerName}
                              </div>
                            </td>
                            <td className="p-3 sm:p-4 font-medium text-xs sm:text-sm">
                              ₹ {order.finalAmount.toFixed(2)}
                            </td>
                            <td className="p-3 sm:p-4">
                              <span
                                className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                              >
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                              {formatDate(order.orderDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105" 
                onClick={() => router.push('/admin/products')}
              >
                <CardContent className="p-4 sm:p-6">
                  <Package className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
                  <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Manage Products</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Add, edit, or remove products from your catalog
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105" 
                onClick={() => router.push('/admin/orders')}
              >
                <CardContent className="p-4 sm:p-6">
                  <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
                  <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">View Orders</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Track and manage customer orders
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105" 
                onClick={() => router.push('/admin/customers')}
              >
                <CardContent className="p-4 sm:p-6">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-3 sm:mb-4" />
                  <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Customer Management</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    View and manage customer information
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}