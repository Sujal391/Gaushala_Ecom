// components/layout/Footer.tsx
"use client";

import {
  Mail,
  Phone,
  MapPin,
  Heart,
  Facebook,
  Instagram,
  Linkedin,
  ExternalLink,
  Leaf,
  ChevronRight,
  Sprout,
  Building,
  Building2Icon,
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
    <footer className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-t border-slate-200 dark:border-slate-800 mt-20">
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-200/20 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100/10 dark:bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative">
        {/* Newsletter Section - Enhanced with professional colors */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative h-40 w-40 group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
              <img
                src="/logo.png"
                alt="Untapped Nature Logo"
                className="h-full w-full object-contain relative z-10"
              />
            </div>
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Untapped Nature
            </span>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Discover the purest essentials for a natural lifestyle. Join our community of nature lovers.
          </p>
          
          {/* Newsletter Form - Enhanced styling */}
          <div className="max-w-md mx-auto">
            <form className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
                />
              </div>
              <Button 
                type="submit" 
                className="whitespace-nowrap bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Gaushala Promotion Section - Enhanced with professional gradient */}
        <div className="relative overflow-hidden rounded-2xl mb-12 group">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 animate-gradient-x opacity-90"></div>
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
          
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/20">
            <div className="flex items-center gap-4 text-white">
              <div className="hidden md:flex h-16 w-16 rounded-full bg-white/20 backdrop-blur items-center justify-center">
                <Building2Icon className="h-8 w-8" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-5 w-5" />
                  <h3 className="text-xl md:text-2xl font-bold">
                    Visit Our Sacred Gaushala
                  </h3>
                </div>
                <p className="text-white/90 max-w-2xl">
                  Discover <span className="font-semibold">Karnavati Kamdhenu Gaushala, Sanoda</span> - 
                  Where we rescue, protect, and nurture cows while promoting sustainable living and traditional practices.
                </p>
                
                {/* Quick highlights with white styling */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Cow Protection", "Panchgavya Products", "Sustainable Farming", "Traditional Values"].map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                      <span className="w-1 h-1 rounded-full bg-white"></span>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Enhanced CTA Button */}
            <a
              href="https://geercow.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl group"
            >
              <span>Explore geercow.com</span>
              <ExternalLink className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Main Footer Content - Enhanced with better spacing and colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-8 relative">
          {/* Contact Details Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 relative inline-block">
              Contact Details
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></span>
            </h3>
            
            <div className="space-y-3">
              {[
                { icon: Mail, text: "info@untappednature.com", href: "mailto:info@untappednature.com" },
                { icon: Phone, text: "+91 98240 97037", href: "tel:+919824097037" },
                { icon: MapPin, text: "Karnavati kamdhenu gaushala, Sanoda, Gujarat", href: null }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <item.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {item.text}
                    </span>
                  )}
                </div>
              ))}
              
              {/* Social Icons - Enhanced */}
              <div className="flex items-center gap-3 pt-2">
                {[
                  { icon: Facebook, href: "https://www.facebook.com/untappednature", color: "hover:text-blue-600" },
                  { icon: Instagram, href: "https://www.instagram.com/untappednature", color: "hover:text-pink-600" },
                  { icon: Linkedin, href: "https://www.linkedin.com/company/untappednature", color: "hover:text-blue-700" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ${social.color} hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110`}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Columns - Enhanced */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4 relative inline-block">
                {column.title}
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></span>
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 inline-flex items-center gap-1 group"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar - Enhanced with subtle gradient */}
        <div className="relative border-t border-slate-200 dark:border-slate-800 pt-6 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              © {currentYear} Untapped Nature. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-rose-500 fill-current animate-pulse" />
              <span>for nature lovers</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </footer>
  );
};

export const MobileFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 md:hidden relative">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
      
      <div className="container mx-auto px-4 py-6 relative">
        <div className="text-center">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative h-16 w-16">
              <img
                src="/logo.png"
                alt="Untapped Nature Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Untapped Nature
            </span>
          </div>
          
          {/* Newsletter Section */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Subscribe for exclusive offers
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <Button 
                type="submit" 
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                Subscribe
              </Button>
            </form>
          </div>

          {/* Gaushala Promotion - Mobile Enhanced */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                <h3 className="font-semibold text-base">Our Gaushala</h3>
              </div>
              <p className="text-xs text-white/90">
                Visit Karnavati Kamdhenu Gaushala - Protecting and nurturing cows since 2010
              </p>
              <a
                href="https://geercow.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-4 py-2 bg-white text-emerald-600 text-sm rounded-lg w-full justify-center font-medium"
              >
                <span>Explore geercow.com</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 text-slate-900 dark:text-slate-100">Contact</h3>
            <div className="space-y-2">
              <a 
                href="mailto:info@untappednature.com" 
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 block"
              >
                <Mail className="inline-block h-3 w-3 mr-1" />
                info@untappednature.com
              </a>
              <a 
                href="tel:+919824097037" 
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 block"
              >
                <Phone className="inline-block h-3 w-3 mr-1" />
                +91 98240 97037
              </a>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <MapPin className="inline-block h-3 w-3 mr-1" />
                Karnavati kamdhenu gaushala, Sanoda
              </div>
            </div>
          </div>
          
          {/* Footer Links */}
          <div className="flex justify-center gap-4 mb-4">
            <a href="#" className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              Privacy
            </a>
            <a href="#" className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              Terms
            </a>
            <a href="#" className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              Contact
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-xs text-slate-600 dark:text-slate-400">
            © {currentYear} Untapped Nature. All rights reserved.
          </p>

          {/* Made with love */}
          <div className="flex items-center justify-center gap-1 mt-3 text-xs text-slate-600 dark:text-slate-400">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-current" />
            <span>for nature lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};