"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  Mail,
  Phone,
  Search,
  // Home,
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
import { Footer, MobileFooter } from "./UserFooter";

interface ProfileData {
  userId: number;
  name: string;
  email: string;
  mobileNo: string;
  referralCode: string;
  referredByUserId: number | null;
  createdAt: string;
}

// Create a separate component for MobileSidebarContent to prevent re-renders
interface MobileSidebarContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e?: React.FormEvent) => void;
  handleClearSearch: () => void;
  pathName: string;
  navigateTo: (path: string) => void;
  user: User | null;
  openProfile: () => void;
  openAuthModal: (mode: "register" | "login") => void;
  navTabs: Array<{
    id: string;
    label: string;
    path: string;
    icon: any;
    show: boolean;
  }>;
}

const MobileSidebarContent = memo(function MobileSidebarContent({
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleClearSearch,
  pathName,
  navigateTo,
  user,
  openProfile,
  openAuthModal,
  navTabs,
}: MobileSidebarContentProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Update local state when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleLocalSearch = (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  
  if (localSearchQuery.trim()) {
    const params = new URLSearchParams();
    params.set("search", localSearchQuery.trim());
    router.push(`/shop?${params.toString()}`);
  } else {
    router.push("/shop");
  }
  
  setIsMobileMenuOpen(false);
};

  const handleLocalClearSearch = () => {
    setLocalSearchQuery("");
    handleClearSearch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative h-20 w-20">
            <img
              src="/logo.png"
              alt="Untapped Nature Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xl font-bold">Untapped Nature</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Discover the purest essentials for a natural lifestyle.
        </p>
      </div>

      {/* Mobile Search Bar */}
      {/* <div className="p-4 border-b">
        <form onSubmit={handleLocalSearch} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search products           ..."
              value={localSearchQuery}
              onChange={handleInputChange}
              className="flex-1 pl-4 pr-10 h-10 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus={false}
            />
            {localSearchQuery && (
              <button
                type="button"
                onClick={handleLocalClearSearch}
                className="absolute right-10 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 h-7 w-7 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div> */}

      {/* Navigation Tabs */}
      <div className="flex-1 p-2">
        <div className="space-y-1">
          {/* Home Button */}
          {/* <Button
            variant={pathName === "/shop" ? "secondary" : "ghost"}
            onClick={() => navigateTo("/shop")}
            className="w-full justify-start gap-3"
          >
            <Home className="h-4 w-4" />
            Home
          </Button> */}

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

          {/* Profile Section - Integrated with navigation */}
          {user ? (
            <>
              {/* Profile Actions */}
              <Button
                variant="ghost"
                onClick={openProfile}
                className="w-full justify-start gap-3"
              >
                <UserIcon className="h-4 w-4" />
                My Profile
              </Button>
            </>
          ) : (
            /* Login/Signup for non-authenticated users */
            <div className="mt-4 p-3 border rounded-lg">
              <p className="text-sm font-medium mb-2">Welcome!</p>
              <p className="text-xs text-muted-foreground mb-3">
                Sign in to access your profile and orders.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => openAuthModal("login")}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Login
                </Button>
                <Button
                  onClick={() => openAuthModal("register")}
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer in Sidebar */}
      <div className="p-4 border-t">
        <div className="space-y-2 mb-3">
          <a 
            href="mailto:info@untappednature.com" 
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-2"
          >
            <Mail className="h-3 w-3" />
            info@untappednature.com
          </a>
          <a 
            href="tel:+919824097037" 
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-2"
          >
            <Phone className="h-3 w-3" />
            +91 98240 97037
          </a>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Untapped Nature. All rights reserved.
        </p>
      </div>
    </div>
  );
});

export default function UserLayout({ children }: LayoutProps) {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const { cartCount, clearCart, fetchCart } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [referralCode, setReferralCode] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);

  const navTabs = [
    {
      id: "shop",
      label: "Shop",
      path: "/shop",
      icon: ShoppingBag,
      show: !!user,
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

  // Load search query from URL
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

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

const handleSearch = useCallback((e?: React.FormEvent) => {
  if (e) e.preventDefault();
  
  if (searchQuery.trim()) {
    const params = new URLSearchParams();
    params.set("search", searchQuery.trim());
    router.push(`/shop?${params.toString()}`);
  } else {
    router.push("/shop");
  }
  
  setShowMobileSearch(false);
  setIsMobileMenuOpen(false);
}, [searchQuery, router]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`/shop?${params.toString()}`);
    setShowMobileSearch(false);
  }, [searchParams, router]);

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
    setIsProfileMenuOpen(false);
    router.push("/shop");
  };

  const openAuthModal = useCallback((mode: "register" | "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, []);

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleAuthSuccess = async () => {
    loadUser();
    await fetchCart();
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const openProfile = useCallback(() => {
    setShowProfileModal(true);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, []);

  const closeProfile = () => {
    setShowProfileModal(false);
  };

  const navigateTo = useCallback((path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [router]);

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
              {/* Logo and Mobile Menu */}
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
                    <MobileSidebarContent
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      handleSearch={handleSearch}
                      handleClearSearch={handleClearSearch}
                      pathName={pathName}
                      navigateTo={navigateTo}
                      user={user}
                      openProfile={openProfile}
                      openAuthModal={openAuthModal}
                      navTabs={navTabs}
                    />
                  </SheetContent>
                </Sheet>

                {/* Logo */}
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push("/shop")}
                >
                  <div className="relative h-24 w-24 md:h-30 md:w-30">
                    <img
                      src="/logo.png"
                      alt="Untapped Nature Logo"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-xl font-bold md:text-2xl">
                    Untapped Nature
                  </span>
                </div>
              </div>

              {/* Desktop Search Bar */}
              <div className="hidden md:block flex-1 max-w-md mx-4">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 pl-4 pr-10 h-10 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-10 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="absolute right-2 h-7 w-7 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </form>
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

              {/* Right Actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Mobile Search Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                >
                  <Search className="h-5 w-5" />
                </Button>

                {/* Desktop Referral Code with Tooltip */}
                {user && referralCode && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="hidden md:flex items-center gap-2 border border-primary/20 rounded-lg px-3 py-1.5 bg-primary/5 cursor-help group hover:bg-primary/10 transition-colors">
                        <Info className="h-3 w-3 text-primary/60 group-hover:text-primary" />
                        <span className="text-xs text-muted-foreground mr-1">
                          Referral Code:
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

                {/* Mobile Profile Menu (Dropdown) - Only shows Login option */}
                <div className="md:hidden">
                  <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <UserIcon className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {user ? (
                        <>
                          <div className="px-2 py-1.5">
                            <p className="font-medium text-sm truncate">{user.name || user.email}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem onClick={() => openAuthModal("login")}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          Login
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Cart Icon */}
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
                    Sign Up
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Search Bar (shown below header when toggled) */}
{showMobileSearch && (
  <div className="md:hidden py-3 border-t">
    <form onSubmit={(e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        const params = new URLSearchParams();
        params.set("search", searchQuery.trim());
        router.push(`/shop?${params.toString()}`);
      } else {
        router.push("/shop");
      }
      setShowMobileSearch(false);
    }} className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 pl-4 pr-10 h-10 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              router.push("/shop");
              setShowMobileSearch(false);
            }}
            className="absolute right-10 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 h-7 w-7 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  </div>
)}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Desktop Footer */}
        <div className="hidden md:block">
          <Footer />
        </div>

        {/* Mobile Footer */}
        <div className="md:hidden">
          <MobileFooter />
        </div>

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