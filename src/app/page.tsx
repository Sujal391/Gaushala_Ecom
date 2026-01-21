"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin } from '../lib/api/config';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication and role, then redirect accordingly
    const authenticated = isAuthenticated();
    const adminUser = isAdmin();

    if (authenticated && adminUser) {
      // Admin user - redirect to admin dashboard (never to shop)
      router.replace('/admin');
    } else {
      // Regular user or unauthenticated - redirect to shop
      router.replace('/shop');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}