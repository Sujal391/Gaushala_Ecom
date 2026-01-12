"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  User as UserIcon,
  ShoppingCart,
  Package,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  getUser,
  removeAuthToken,
  isAuthenticated,
} from "../../lib/api/config";

import { LayoutProps, User } from "../../types";
import { useCart } from "../../context/CartContext";

import SignUp from "../SignUp";
import Profile from "../MyProfile";

export default function UserLayout({ children }: LayoutProps) {
  const router = useRouter();
  const pathName = usePathname();

  const { cartCount, clearCart, fetchCart } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const navTabs = [
    {
      id: "shop",
      label: "Shop",
      path: "/user/shop",
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
  ];

  // Load user once
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = () => {
    if (isAuthenticated()) {
      setUser(getUser());
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    clearCart(); // 🔥 reset global cart
    setUser(null);
    router.push("/shop");
  };

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleAuthSuccess = async () => {
    loadUser();
    await fetchCart(); // 🔥 sync cart after login
  };

  const openProfile = () => {
    setShowProfileModal(true);
  };

  const closeProfile = () => {
    setShowProfileModal(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push("/user/shop")}
            >
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">StyleHub Store</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1">
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
                      <span className="hidden sm:inline">{tab.label}</span>
                    </Button>
                  )
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Cart */}
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

              {/* User */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {user.name || user.email}
                      </span>
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
              ) : (
                <>
                  <Button
                    onClick={() => openAuthModal("login")}
                    className="hidden sm:flex"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button
                    onClick={() => openAuthModal("login")}
                    size="icon"
                    className="sm:hidden"
                  >
                    <UserIcon className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-auto">
        <div className="container mx-auto px-4 py-8 text-center">
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
  );
}
