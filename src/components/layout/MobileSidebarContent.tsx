// components/layout/MobileSidebarContent.tsx
"use client";

import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, User as UserIcon, X } from "lucide-react";
import { User } from "../../types";

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
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const MobileSidebarContent = memo(function MobileSidebarContent({
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
  setIsMobileMenuOpen,
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
      window.location.href = `/shop?${params.toString()}`;
    } else {
      window.location.href = "/shop";
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
        <div className="flex items-center gap-3 mb-3">
          <div className="relative h-16 w-16 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Untapped Nature Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col font-bold text-xl leading-none">
            <span>Untapped</span>
            <span>Nature</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          sanoda, Gandhinagar, Gujarat, India
        </p>

        <div className="border-t pt-4 space-y-3">
          <a
            href="tel:+917096712340"
            className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#e6f4e0] border border-[#c8dea8] text-[#3b7a2a] flex-shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <span>+91 70967 12340</span>
          </a>
          <a
            href="mailto:info@untappednature.com"
            className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#eef6fb] border border-[#b8d9ea] text-[#2d6e8e] flex-shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <span>info@untappednature.com</span>
          </a>
        </div>
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

          <Button
            variant={pathName === "/about" ? "secondary" : "ghost"}
            onClick={() => navigateTo("/about")}
            className="w-full justify-start gap-3"
          >
            About Us
          </Button>

          <Button
            variant={pathName === "/contact" ? "secondary" : "ghost"}
            onClick={() => navigateTo("/contact")}
            className="w-full justify-start gap-3"
          >
            Contact Us
          </Button>

          {/* Profile Section - Integrated with navigation */}
          {user ? (
            <>
              {/* Profile Actions */}
              <Button
                variant="ghost"
                onClick={() => {
                  openProfile();
                  setIsMobileMenuOpen(false);
                }}
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
                  onClick={() => {
                    openAuthModal("login");
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    openAuthModal("register");
                    setIsMobileMenuOpen(false);
                  }}
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
      <div className="p-4 border-t text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Untapped Nature. All rights reserved.
        </p>
      </div>
    </div>
  );
});
