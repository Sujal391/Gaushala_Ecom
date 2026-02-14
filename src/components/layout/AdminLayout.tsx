"use client";

import { useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  ShoppingBag,
  Clock,
  TagIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { removeAuthToken } from '../../lib/api/config';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  headerAction?: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: Users, label: 'Sample Requests', href: '/admin/sample' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: Clock, label: 'Pending Orders', href: '/admin/pending' },
  { icon: TagIcon, label: 'Offers', href: '/admin/offer' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: Users, label: 'Referrals', href: '/admin/referrals' },
  { icon: ShoppingBag, label: 'Banners', href: '/admin/banner' },
];

export default function AdminLayout({ children, title, headerAction }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/shop');
  };

  const Sidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-card border-r flex flex-col h-full`}>
      <div className="p-4 sm:p-6 border-b">
  <div className="flex items-center gap-1">
    <div className="relative h-10 w-10 sm:h-25 sm:w-25">
      <img
        src="/logo.png"
        alt="Untapped Nature Logo"
        className="h-full w-full object-contain"
      />
    </div>
    <span className="text-xl sm:text-2xl font-bold">Admin</span>
  </div>
</div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant={pathname === item.href ? 'secondary' : 'ghost'}
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
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
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
              {/* Mobile Menu */}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px]">
                  <Sidebar isMobile={true} />
                </SheetContent>
              </Sheet>

              <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
            </div>

            <div className="flex items-center gap-2">
              {headerAction}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}