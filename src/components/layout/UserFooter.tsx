// components/layout/Footer.tsx
"use client";

import {
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/shop" },
        { label: "Best Sellers", href: "/shop" },
        { label: "New Arrivals", href: "/shop" },
        { label: "Sale", href: "/shop" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "Contact Us", href: "#" },
        { label: "Shipping Policy", href: "#" },
        { label: "Returns & Refunds", href: "#" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Sustainability", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookie Policy", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-muted/30 border-t mt-20">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Your logo instead of ShoppingBag */}
            <div className="relative h-40 w-40">
              <img
                src="/logo.png"
                alt="Untapped Nature Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold">Untapped Nature</span>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Discover the purest essentials for a natural lifestyle. Join our community of nature lovers.
          </p>
          
          {/* Newsletter Form */}
          <div className="max-w-md mx-auto">
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="whitespace-nowrap">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-8">
          {/* Contact Details Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Details</h3>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href="mailto:info@untappednature.com"
                  className="text-sm hover:text-primary transition-colors"
                >
                  info@untappednature.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href="tel:+919824097037"
                  className="text-sm hover:text-primary transition-colors"
                >
                  +91 98240 97037
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Karnavati kamdhenu gaushala, Sanoda, Gujarat
                </span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold text-lg mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Untapped Nature. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-destructive fill-current" />
              <span>for nature lovers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const MobileFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background md:hidden">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* Your logo instead of ShoppingBag in mobile */}
            <div className="relative h-16 w-16">
              <img
                src="/logo.png"
                alt="Untapped Nature Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-lg font-bold">Untapped Nature</span>
          </div>
          
          {/* Newsletter Section in Mobile */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              Subscribe for exclusive offers
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm">
                Subscribe
              </Button>
            </form>
          </div>

          {/* Contact Details in Mobile Footer */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Contact Details</h3>
            <div className="space-y-2">
              <a 
                href="mailto:info@untappednature.com" 
                className="text-xs text-muted-foreground hover:text-primary block"
              >
                <Mail className="inline-block h-3 w-3 mr-1" />
                info@untappednature.com
              </a>
              <a 
                href="tel:+919824097037" 
                className="text-xs text-muted-foreground hover:text-primary block"
              >
                <Phone className="inline-block h-3 w-3 mr-1" />
                +91 98240 97037
              </a>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mb-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">
              Privacy
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">
              Terms
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">
              Contact
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground">
            © {currentYear} Untapped Nature. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};