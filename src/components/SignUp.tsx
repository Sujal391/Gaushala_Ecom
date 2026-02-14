"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { loginUser, registerUserPhase1, registerUserPhase2 } from '../lib/api/auth';
import { toast } from 'sonner';
import { isAdmin,setAuthCookie, clearAuthCookie } from '../lib/api/config';

type AuthMode = 'login' | 'register';
type RegisterStep = 1 | 2;

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
  const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phase1Identifier, setPhase1Identifier] = useState('');
  
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
      setRegisterStep(1);
      setPhase1Identifier('');
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
    setRegisterStep(1);
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

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile: string) => {
    const cleanedMobile = mobile.replace(/\D/g, '');
    return cleanedMobile.length === 10;
  };

  const hasSpaces = (value: string) => {
    return /\s/.test(value);
  };

  const isValidForPhase1 = () => {
    const { name, email, mobileNo } = registerForm;
    
    if (!name.trim() || !email.trim() || !mobileNo.trim()) {
      setError('All fields are required');
      return false;
    }

    if (hasSpaces(email)) {
      setError('Email cannot contain spaces');
      return false;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (hasSpaces(mobileNo)) {
      setError('Mobile number cannot contain spaces');
      return false;
    }

    if (!validateMobile(mobileNo)) {
      setError('Mobile number must be exactly 10 digits');
      return false;
    }

    return true;
  };

  // Format mobile number input
  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '');
    const limitedDigits = digitsOnly.slice(0, 10);
    
    setRegisterForm({
      ...registerForm,
      mobileNo: limitedDigits
    });
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

        toast.success('Login Successful!', {
          description: `Welcome back! ${response.data?.name}`,
          duration: 3000,
        });

        const role = response.data?.role || response.user?.role || "User";
        const token = response.token || response.data?.token;
        
        setAuthCookie(token, role);

        if (onAuthSuccess) {
          onAuthSuccess();
        }

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

  const handleRegisterPhase1 = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');

    if (!isValidForPhase1()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        mobileNo: registerForm.mobileNo.replace(/\D/g, ''),
        createdAt: new Date().toISOString(),
      };

      const response = await registerUserPhase1(payload);
      console.log('Register phase 1 response:', response);

      if (response && response.success) {
        setPhase1Identifier(registerForm.email.trim());
        setRegisterStep(2);
        
        toast.success('Details saved', {
          description: 'Now set your password',
          duration: 3000,
        });
      } else {
        setError(response?.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Registration phase 1 error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPhase2 = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');

    if (!registerForm.password.trim() || !registerForm.confirmPassword.trim()) {
      setError('Password fields are required');
      return;
    }

    if (hasSpaces(registerForm.password)) {
      setError('Password cannot contain spaces');
      return;
    }

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
        emailOrMobile: phase1Identifier,
        password: registerForm.password.trim(),
        confirmPassword: registerForm.confirmPassword.trim(),
        referralCode: registerForm.referralCode.trim(),
      };

      const response = await registerUserPhase2(payload);
      console.log('Register phase 2 response:', response);

      if (response && response.success) {
        setRegisterForm({ 
          name: '', 
          email: '', 
          mobileNo: '', 
          password: '', 
          confirmPassword: '',
          referralCode: '' 
        });
        setError('');
        setRegisterStep(1);
        setAuthMode('login');
        
        toast.success('Registration Successful!', {
          description: 'Your account has been created. Please login with your credentials.',
          duration: 4000,
        });
      } else {
        setError(response?.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Registration phase 2 error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {authMode === 'login' ? 'Welcome back' : 'Create an account'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {authMode === 'login' ? (
            // Login Form
            <>
              <div className="space-y-2">
                <label htmlFor="emailOrMobile" className="text-sm mb-20 font-medium">
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
                <div className="text-muted-foreground">Don't have an account? </div>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-primary text-lg hover:underline font-medium cursor-pointer"
                  disabled={loading}
                >
                  Click Here and Please Enter Details.
                </button>
              </div>
            </>
          ) : (
            // Register Form
            <>
              {registerStep === 1 ? (
                // Phase 1: Personal Details
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
                      onChange={handleMobileInputChange}
                      placeholder="1234567890"
                      required
                      disabled={loading}
                      maxLength={10}
                    />
                    {registerForm.mobileNo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {registerForm.mobileNo.replace(/\D/g, '').length}/10 digits
                      </p>
                    )}
                  </div>

                  <Button 
                    onClick={handleRegisterPhase1} 
                    className="w-full" 
                    size="lg" 
                    disabled={loading || !registerForm.name.trim() || !registerForm.email.trim() || !registerForm.mobileNo.replace(/\D/g, '')}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Next'
                    )}
                  </Button>

                  {/* Need Help Ordering Section */}
                  <div className="pt-4 pb-2 border-t border-border/50">
                    <p className="text-sm font-medium text-center text-muted-foreground mb-3">
                      Need help ordering?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="tel:+919824097037"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        Call Now
                      </a>
                      <a
                        href="https://wa.me/919824097037"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="text-center text-sm">
                    <div className="text-muted-foreground">Already have an account? </div>
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
              ) : (
                // Phase 2: Password Setup
                <>
                  <div className="flex items-center mb-2">
                    <button
                      type="button"
                      onClick={() => setRegisterStep(1)}
                      className="text-muted-foreground hover:text-foreground transition-colors mr-2"
                      disabled={loading}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Step 2 of 2
                    </span>
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
                        placeholder="Create a password"
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
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters, no spaces
                    </p>
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
                        placeholder="Confirm your password"
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

                  <Button 
                    onClick={handleRegisterPhase2} 
                    className="w-full" 
                    size="lg" 
                    disabled={loading || !registerForm.password.trim() || !registerForm.confirmPassword.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}