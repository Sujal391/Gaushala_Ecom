"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin } from '../lib/api/config';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a returnUrl in the query params
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    
    // If there's a returnUrl, redirect there instead
    if (returnUrl) {
      router.replace(returnUrl);
      return;
    }

    // Check authentication and role, then redirect accordingly
    const authenticated = isAuthenticated();
    const adminUser = isAdmin();

    if (authenticated && adminUser) {
      // Admin user - redirect to admin dashboard
      router.replace('/admin');
    } else {
      // For regular users or unauthenticated, check if they were trying to go somewhere
      const lastVisitedPage = localStorage.getItem('lastVisitedPage');
      
      // Don't redirect to cart if they're not authenticated? 
      // Let's just redirect to shop as default
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