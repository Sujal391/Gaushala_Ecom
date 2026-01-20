"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  User as UserIcon,
  ShoppingCart,
  Package,
  LogOut,
  Copy,
  Check,
  Menu,
  X,
  Home,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  getUser,
  removeAuthToken,
  isAuthenticated,
  clearAuthCookie,
} from "../../lib/api/config";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Info } from "lucide-react";
import { getMyProfile } from "@/src/lib/api/auth";
import { LayoutProps, User } from "../../types";
import { useCart } from "../../context/CartContext";

import SignUp from "../SignUp";
import Profile from "../MyProfile";

// Add this interface for profile response
interface ProfileData {
  userId: number;
  name: string;
  email: string;
  mobileNo: string;
  referralCode: string;
  referredByUserId: number | null;
  createdAt: string;
}

interface ProfileResponse {
  success: boolean;
  data: ProfileData;
}

export default function UserLayout({ children }: LayoutProps) {
  const router = useRouter();
  const pathName = usePathname();

  const { cartCount, clearCart, fetchCart } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [referralCode, setReferralCode] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navTabs = [
    {
      id: "shop",
      label: "Shop",
      path: "/shop",
      icon: ShoppingBag,
      show: true,
    },
    {
      id: "orders",
      label: "My Orders",
      path: "/my-orders",
      icon: Package,
      show: !!user,
    },
    {
      id: "samples",
      label: "My Samples",
      path: "/user/sample",
      icon: Package,
      show: !!user,
    },
  ];

  // Load user and profile once
  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadReferralCode();
    }
  }, [user]);

  const loadUser = () => {
    if (isAuthenticated()) {
      setUser(getUser());
    } else {
      setUser(null);
      setReferralCode("");
    }
  };

  const loadReferralCode = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await getMyProfile() as any;
      
      if (response) {
        if (response.success && response.data?.referralCode) {
          setReferralCode(response.data.referralCode);
        } else if (response.referralCode) {
          setReferralCode(response.referralCode);
        } else if (response.data?.referralCode) {
          setReferralCode(response.data.referralCode);
        }
      }
    } catch (error) {
      console.error("Failed to load referral code:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    clearAuthCookie();
    clearCart();
    setUser(null);
    setReferralCode("");
    setIsMobileMenuOpen(false);
    router.push("/shop");
  };

  const openAuthModal = (mode: "register" | "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleAuthSuccess = async () => {
    loadUser();
    await fetchCart();
    setIsMobileMenuOpen(false);
  };

  const openProfile = () => {
    setShowProfileModal(true);
    setIsMobileMenuOpen(false);
  };

  const closeProfile = () => {
    setShowProfileModal(false);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  // Mobile sidebar content
  const MobileSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User Info Section */}
      <div className="p-4 border-b">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name || user.email}</p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Welcome! Please sign in to access all features
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => openAuthModal("login")}
                variant="outline"
                className="flex-1"
              >
                Login
              </Button>
              <Button
                onClick={() => openAuthModal("register")}
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 p-2">
        <div className="space-y-1">
          {navTabs.map(
            (tab) =>
              tab.show && (
                <Button
                  key={tab.id}
                  variant={pathName === tab.path ? "secondary" : "ghost"}
                  onClick={() => navigateTo(tab.path)}
                  className="w-full justify-start gap-3"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
          )}
        </div>

        {/* Referral Code Section */}
        {user && referralCode && (
          <div className="mt-6 p-4 border rounded-lg bg-primary/5">
            <p className="text-sm font-medium mb-2">Your Referral Code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm font-semibold bg-background px-3 py-2 rounded border">
                {referralCode}
              </code>
              <Button
                size="sm"
                variant={copied ? "default" : "outline"}
                onClick={copyReferralCode}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* User Menu Items */}
        {user && (
          <div className="mt-6 space-y-1">
            <Button
              variant="ghost"
              onClick={openProfile}
              className="w-full justify-start gap-3"
            >
              <UserIcon className="h-4 w-4" />
              My Profile
            </Button>
            {/* <Button
              variant="ghost"
              onClick={() => navigateTo("/my-orders")}
              className="w-full justify-start gap-3"
            >
              <Package className="h-4 w-4" />
              My Orders
            </Button> */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Footer in Sidebar */}
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 StyleHub. All rights reserved.
        </p>
      </div>
    </div>
  );

  // For debugging - log the referral code state
  useEffect(() => {
    console.log("Referral Code State:", referralCode);
  }, [referralCode]);

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                  <MobileSidebarContent />
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => router.push("/shop")}
              >
                <ShoppingBag className="h-7 w-7 text-primary md:h-8 md:w-8" />
                <span className="text-xl font-bold md:text-2xl">
                  StyleHub Store
                </span>
              </div>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              {navTabs.map(
                (tab) =>
                  tab.show && (
                    <Button
                      key={tab.id}
                      variant={pathName === tab.path ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => router.push(tab.path)}
                      className="flex items-center gap-2"
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </Button>
                  )
              )}
            </div>

            {/* Right Actions - Cart stays outside sidebar */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Referral Code with Tooltip */}
              {user && referralCode && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="hidden md:flex items-center gap-2 border border-primary/20 rounded-lg px-3 py-1.5 bg-primary/5 cursor-help group hover:bg-primary/10 transition-colors">
                      <Info className="h-3 w-3 text-primary/60 group-hover:text-primary" />
                      <span className="text-xs text-muted-foreground mr-1">
                        Code:
                      </span>
                      <code className="font-mono text-sm font-semibold">
                        {referralCode}
                      </code>
                      <Button
                        size="sm"
                        variant={copied ? "default" : "ghost"}
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyReferralCode();
                        }}
                      >
                        {copied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3 bg-white text-black border">
                    <p className="text-sm font-medium mb-1">🎉 Referral Bonus!</p>
                    <p className="text-xs">
                      You and your referral will get 10% discount on 1st order after referral activation.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Loading state for referral code */}
              {user && !referralCode && loading && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5">
                  <div className="animate-pulse h-4 w-24 bg-muted rounded"></div>
                </div>
              )}

              {/* Cart Icon - Always visible */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>

              {/* Desktop User Menu - Hidden on mobile */}
              {user ? (
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>{user.name || user.email}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={openProfile}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push("/my-orders")}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive pl-3 gap-3 hover:text-destructive focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4 text-destructive" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button
                  onClick={() => openAuthModal("register")}
                  className="hidden md:flex"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center">
          <ShoppingBag className="h-6 w-6 mx-auto text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            © 2024 StyleHub. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <SignUp
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      <Profile isOpen={showProfileModal} onClose={closeProfile} />
    </div>
    </TooltipProvider>
  );
}