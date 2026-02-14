// app/user/layout.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShoppingBag, Package } from "lucide-react";

import {
  getUser,
  removeAuthToken,
  isAuthenticated,
  clearAuthCookie,
} from "../../lib/api/config";

import { getMyProfile } from "@/src/lib/api/auth";
import { LayoutProps, User } from "../../types";
import { useCart } from "../../context/CartContext";

import SignUp from "../SignUp";
import Profile from "../MyProfile";
import { Footer, MobileFooter } from "./UserFooter";
import { UserHeader } from "./UserHeader";

// Separate component that uses useSearchParams
function HeaderWrapper({ 
  user, 
  referralCode, 
  loading, 
  cartCount,
  onOpenAuthModal,
  onOpenProfile,
  onLogout,
  onCopyReferralCode,
  copied,
  navTabs
}: any) {
  return (
    <UserHeader
      user={user}
      referralCode={referralCode}
      loading={loading}
      cartCount={cartCount}
      onOpenAuthModal={onOpenAuthModal}
      onOpenProfile={onOpenProfile}
      onLogout={onLogout}
      onCopyReferralCode={onCopyReferralCode}
      copied={copied}
      navTabs={navTabs}
    />
  );
}

export default function UserLayout({ children }: LayoutProps) {
  const router = useRouter();

  const { cartCount, clearCart, fetchCart } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [referralCode, setReferralCode] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

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
    router.push("/shop");
  };

  const openAuthModal = (mode: "register" | "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleAuthSuccess = async () => {
    loadUser();
    await fetchCart();
  };

  const openProfile = () => {
    setShowProfileModal(true);
  };

  const closeProfile = () => {
    setShowProfileModal(false);
  };

  // For debugging - log the referral code state
  useEffect(() => {
    console.log("Referral Code State:", referralCode);
  }, [referralCode]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header with Suspense for search params */}
        <Suspense fallback={<div className="h-16 border-b bg-background/95" />}>
          <HeaderWrapper
            user={user}
            referralCode={referralCode}
            loading={loading}
            cartCount={cartCount}
            onOpenAuthModal={openAuthModal}
            onOpenProfile={openProfile}
            onLogout={handleLogout}
            onCopyReferralCode={copyReferralCode}
            copied={copied}
            navTabs={navTabs}
          />
        </Suspense>

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