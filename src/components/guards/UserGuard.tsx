"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin } from '../../lib/api/config';
import { Loader2 } from 'lucide-react';

export default function UserGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const admin = isAdmin();
      
      console.log('Auth check:', { authenticated, admin }); // Debug log

      if (!authenticated) {
        console.log('Redirecting to /shop - not authenticated');
        router.replace('/shop');
        return;
      }

      if (admin) {
        console.log('Redirecting to /admin - is admin');
        router.replace('/admin');
        return;
      }

      console.log('User authorized - showing content');
      setIsChecking(false);
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}