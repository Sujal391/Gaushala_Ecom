"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, User as UserIcon, Search, ShoppingCart, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getUser, removeAuthToken, isAuthenticated, isAdmin } from '../../lib/api/config';
import { loginUser, registerUser } from '../../lib/api/auth';
import { toast } from 'sonner';
import { CartItem, LayoutProps, User } from '../../types/index';

export default function UserLayout({ children }: LayoutProps) {
  const router = useRouter();
  const pathName = usePathname();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginForm, setLoginForm] = useState({
    emailOrMobile: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    mobileNo: '',
    password: '',
    confirmPassword: '',
  });

  const navTabs = [
    { 
      id: 'shop', 
      label: 'Shop', 
      path: '/shop',
      icon: ShoppingBag,
      show: true // Always show
    },
    { 
      id: 'orders', 
      label: 'My Orders', 
      path: '/my-orders',
      icon: Package,
      show: !!user // Only show when user is logged in
    }
  ];

  useEffect(() => {
    loadCart();
    loadUser();
    const interval = setInterval(() => {
      loadCart();
      loadUser();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadCart = () => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      setCart(JSON.parse(stored));
    }
  };

  const loadUser = () => {
    if (isAuthenticated()) {
      const userData = getUser();
      setUser(userData);
    } else {
      setUser(null);
    }
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    router.push('/shop');
  };

  type AuthMode = 'login' | 'register';
  
  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setError('');
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setError('');
    setLoginForm({ emailOrMobile: '', password: '' });
    setRegisterForm({ name: '', email: '', mobileNo: '', password: '', confirmPassword: '' });
  };

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await loginUser(loginForm);
    console.log('Login response:', response);

    // Check if login was successful - handle both response formats
    const isSuccess = response && response.success && (response.data || (response as any).token);

    if (isSuccess) {
      // User data is already stored in localStorage by loginUser function
      const userData = getUser();
      console.log('User data after login:', userData);
      console.log('Is admin:', isAdmin());

      setUser(userData);
      closeAuthModal();

      // Show success toast
      toast.success('Login Successful!', {
        description: `Welcome back, ${userData?.name || userData?.email || 'User'}!`,
        duration: 3000,
      });

      // Check if admin and redirect
      if (isAdmin()) {
        console.log('Redirecting to admin dashboard...');
        router.push('/admin');
      } else {
        console.log('Regular user logged in, redirecting to shop...');
        router.push('/shop');
      }
    } else {
      const errorMsg = response?.message || response?.error || 'Login failed';
      console.error('Login failed:', errorMsg);
      setError(errorMsg);
      toast.error('Login Failed', {
        description: errorMsg,
        duration: 4000,
      });
    }
  } catch (err) {
    const errorMsg = 'An unexpected error occurred';
    setError(errorMsg);
    toast.error('Login Failed', {
      description: errorMsg,
      duration: 4000,
    });
    console.error('Login error:', err);
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...registerForm,
        createdAt: new Date().toISOString(),
      };

      const response = await registerUser(payload);
      console.log('Register response:', response);

      // FIXED: Check if response exists and has a message
      if (response && response.message) {
        // Check if it's a success message (case-insensitive)
        const successKeywords = ['success', 'successful', 'registered', 'created'];
        const isSuccess = successKeywords.some(keyword => 
          response.message.toLowerCase().includes(keyword.toLowerCase())
        );

        if (isSuccess) {
          // Clear form and switch to login
          setRegisterForm({ name: '', email: '', mobileNo: '', password: '', confirmPassword: '' });
          setError('');
          setAuthMode('login');
          
          // Show success message in a nicer way (not as error)
          toast.success('Registration Successful!', {
            description: 'Your account has been created. Please login with your credentials.',
            duration: 4000,
          });
        } else {
          // If message doesn't indicate success, show it as error
          setError(response.message || 'Registration failed');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/shop')}>
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">StyleHub Store</span>
            </div>

            {/* Navigation Tabs - Add this section */}
            <div className="flex items-center gap-1">
              {navTabs.map((tab) => (
                tab.show && (
                  <Button
                    key={tab.id}
                    variant={pathName === tab.path ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => router.push(tab.path)}
                    className={`flex items-center gap-2 ${pathName === tab.path ? 'bg-secondary' : ''}`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Button>
                )
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => router.push('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>
              
              {user ? (
                <div className="flex items-center gap-5">
                  <span className="text-sm font-medium hidden sm:inline">
                    Hi, {user?.name || user?.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button onClick={() => openAuthModal('login')} className="hidden sm:flex">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button onClick={() => openAuthModal('login')} size="icon" className="sm:hidden">
                    <UserIcon className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">StyleHub Store</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your ultimate destination for fashion.
            </p>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 StyleHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Login/Register) */}
      <Dialog open={showAuthModal} onOpenChange={closeAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {authMode === 'login' ? 'Welcome back' : 'Create an account'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                {error}
              </div>
            )} */}

            {authMode === 'login' ? (
              // Login Form
              <>
                <div className="space-y-2">
                  <label htmlFor="emailOrMobile" className="text-sm font-medium">
                    Email or Mobile *
                  </label>
                  <Input
                    id="emailOrMobile"
                    type="text"
                    value={loginForm.emailOrMobile}
                    onChange={(e) => setLoginForm({ ...loginForm, emailOrMobile: e.target.value })}
                    placeholder="email@example.com or +1234567890"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>

                <Button onClick={handleLogin} className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-primary hover:underline font-medium"
                    disabled={loading}
                  >
                    Register
                  </button>
                </div>
              </>
            ) : (
              // Register Form
              <>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mobileNo" className="text-sm font-medium">
                    Mobile Number *
                  </label>
                  <Input
                    id="mobileNo"
                    type="tel"
                    value={registerForm.mobileNo}
                    onChange={(e) => setRegisterForm({ ...registerForm, mobileNo: e.target.value })}
                    placeholder="+1234567890"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="registerPassword" className="text-sm font-medium">
                    Password *
                  </label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password *
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>

                <Button onClick={handleRegister} className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-primary hover:underline font-medium"
                    disabled={loading}
                  >
                    Login
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}