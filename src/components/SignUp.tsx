"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { loginUser, registerUser } from '../lib/api/auth';
import { toast } from 'sonner';
import { isAdmin } from '../lib/api/config';

type AuthMode = 'login' | 'register';

interface SignUpProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onAuthSuccess?: () => void;
}

export default function SignUp({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onAuthSuccess 
}: SignUpProps) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
    referralCode: '',
  });

  // Reset form when modal opens/closes or mode changes
  React.useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setError('');
      setShowPassword(false);
      setShowRegisterPassword(false);
      setShowConfirmPassword(false);
      setLoginForm({ emailOrMobile: '', password: '' });
      setRegisterForm({ 
        name: '', 
        email: '', 
        mobileNo: '', 
        password: '', 
        confirmPassword: '',
        referralCode: '' 
      });
    }
  }, [isOpen, initialMode]);

  const handleClose = () => {
    setError('');
    setShowPassword(false);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
    setLoginForm({ emailOrMobile: '', password: '' });
    setRegisterForm({ 
      name: '', 
      email: '', 
      mobileNo: '', 
      password: '', 
      confirmPassword: '',
      referralCode: '' 
    });
    onClose();
  };

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(loginForm);
      console.log('Login response:', response);

      const isSuccess = response && response.success && (response.data || (response as any).token);

      if (isSuccess) {
        handleClose();

        // Show success toast
        toast.success('Login Successful!', {
          description: `Welcome back!`,
          duration: 3000,
        });

        // Call success callback if provided
        if (onAuthSuccess) {
          onAuthSuccess();
        }

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
        name: registerForm.name,
        email: registerForm.email,
        mobileNo: registerForm.mobileNo,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        referralCode: registerForm.referralCode,
        createdAt: new Date().toISOString(),
      };

      const response = await registerUser(payload);
      console.log('Register response:', response);

      if (response && response.message) {
        const successKeywords = ['success', 'successful', 'registered', 'created'];
        const isSuccess = successKeywords.some(keyword => 
          response.message.toLowerCase().includes(keyword.toLowerCase())
        );

        if (isSuccess) {
          setRegisterForm({ 
            name: '', 
            email: '', 
            mobileNo: '', 
            password: '', 
            confirmPassword: '',
            referralCode: '' 
          });
          setError('');
          setAuthMode('login');
          
          toast.success('Registration Successful!', {
            description: 'Your account has been created. Please login with your credentials.',
            duration: 4000,
          });
        } else {
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {authMode === 'login' ? 'Welcome back' : 'Create an account'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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
                <div className="relative">
                  <Input
                    id="registerPassword"
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="referralCode" className="text-sm font-medium">
                  Referral Code <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  id="referralCode"
                  type="text"
                  value={registerForm.referralCode}
                  onChange={(e) => setRegisterForm({ ...registerForm, referralCode: e.target.value })}
                  placeholder="Enter referral code"
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
  );
}