"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin } from '../lib/api/config';

/**
 * AuthCheck component that runs on every page load to:
 * 1. Check if token and role are valid
 * 2. Redirect based on role
 * 3. Block admin from user routes
 * 4. Block users from admin routes
 */
export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const authenticated = isAuthenticated();
      const adminUser = isAdmin();

      // Define route patterns
      const isAdminRoute = pathname.startsWith('/admin');
      const isUserOnlyRoute =
        // pathname.startsWith('/cart') ||
        pathname.startsWith('/checkout') ||
        pathname.startsWith('/my-orders') ||
        pathname.startsWith('/user');

      // If on admin route
      if (isAdminRoute) {
        if (!authenticated) {
          // Not authenticated, redirect to shop
          router.replace('/shop');
          return;
        }
        if (!adminUser) {
          // Authenticated but not admin, redirect to shop
          router.replace('/shop');
          return;
        }
        // Admin user on admin route - allow
        return;
      }

      // If on user-only route (cart, checkout, my-orders, user/*)
      if (isUserOnlyRoute) {
        if (!authenticated) {
          // Not authenticated, redirect to shop
          router.replace('/shop');
          return;
        }
        if (adminUser) {
          // Admin trying to access user routes, redirect to admin
          router.replace('/admin');
          return;
        }
        // Regular user on user route - allow
        return;
      }

      // For root path, redirect based on role
      if (pathname === '/') {
        if (authenticated && adminUser) {
          router.replace('/admin');
          return;
        }
        // For non-admin or unauthenticated, let the page component handle it
        return;
      }

      // For other routes (shop, products, etc.) - allow everyone
    };

    checkAuthAndRedirect();
  }, [pathname, router]);

  return <>{children}</>;
}

