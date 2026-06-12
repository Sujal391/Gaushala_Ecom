"use client";

import Link from "next/link";
import UserLayout from "../../components/layout/UserLayout";
import {
  FileText, User, UserPlus, Package, IndianRupee, ShoppingBag,
  CreditCard, Truck, RefreshCw, Copyright, Shield, AlertTriangle,
  Lock, Edit, Headphones, Home, ChevronRight, Mail, Phone, MapPin,
  ExternalLink, Building2, CheckCircle2, Wifi,
} from "lucide-react";

const clauses = [
  { id: 1, icon: FileText, accent: "#3b7a2a", bg: "#f0f7ec", border: "#c8dea8", title: "Introduction", text: "By accessing, browsing or using our website, you agree to be bound by these Terms & Conditions and all applicable laws." },
  { id: 2, icon: User, accent: "#2d6e8e", bg: "#eef6fb", border: "#b8d9ea", title: "Eligibility", text: "You must be at least 18 years old or have the consent of a legal guardian to use our website and place orders." },
  { id: 3, icon: UserPlus, accent: "#6b3a8a", bg: "#f7f0fc", border: "#d9bff0", title: "Account Registration", text: "To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account information." },
  { id: 4, icon: Package, accent: "#8a5c2a", bg: "#fdf6ee", border: "#e8d4b4", title: "Product Information", text: "We make every effort to display accurate product descriptions, images and information. However, actual products may vary slightly in color, size or appearance." },
  { id: 5, icon: IndianRupee, accent: "#3b7a2a", bg: "#f0f7ec", border: "#c8dea8", title: "Pricing & Taxes", text: "All prices are listed in INR and are inclusive of applicable taxes. Prices are subject to change without prior notice." },
  { id: 6, icon: ShoppingBag, accent: "#8a3a3a", bg: "#fdf0f0", border: "#f0c4c4", title: "Orders", text: "We reserve the right to accept, reject or cancel any order due to stock unavailability, pricing errors, suspected fraud, or other reasons beyond our control." },
  { id: 7, icon: CreditCard, accent: "#2d6e8e", bg: "#eef6fb", border: "#b8d9ea", title: "Payments", text: "All payments are processed securely through trusted third-party payment gateways. We do not store your card or bank details." },
  { id: 8, icon: Wifi, accent: "#3b7a2a", bg: "#f0f7ec", border: "#c8dea8", title: "Online Payments", text: "This online payment system is provided by Untapped Nature. Your payment will normally reach the Untapped Nature account within two working days. We cannot accept liability for a payment not reaching the correct Untapped Nature account due to you quoting an incorrect account number or incorrect personal details. If the card supplier declines payment, Untapped Nature is under no obligation to bring this to your attention. In no event will Untapped Nature be liable for any damages whatsoever arising from use of this site or linked websites. The country of domicile for Untapped Nature is India." },
  { id: 9, icon: Truck, accent: "#6b3a8a", bg: "#f7f0fc", border: "#d9bff0", title: "Shipping & Delivery", text: "We aim to deliver your orders within the estimated time. Delivery timelines may vary based on location, courier delays, weather, or other unforeseen circumstances." },
  { id: 10, icon: Copyright, accent: "#8a5c2a", bg: "#fdf6ee", border: "#e8d4b4", title: "Intellectual Property", text: "All content, logos, product images, text and graphics on this website are the property of Untapped Nature and protected by copyright laws." },
  { id: 11, icon: Shield, accent: "#6b3a8a", bg: "#f7f0fc", border: "#d9bff0", title: "User Conduct", text: "You agree not to misuse our website or engage in any activity that may harm, disrupt or interfere with our services or other users." },
  { id: 12, icon: AlertTriangle, accent: "#3b7a2a", bg: "#f0f7ec", border: "#c8dea8", title: "Limitation of Liability", text: "Untapped Nature shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our products or website." },
  { id: 13, icon: Lock, accent: "#2d6e8e", bg: "#eef6fb", border: "#b8d9ea", title: "Privacy Protection", text: "Your privacy is important to us. Please refer to our Privacy Policy to understand how we collect, use and protect your personal information." },
  { id: 14, icon: Edit, accent: "#8a3a3a", bg: "#fdf0f0", border: "#f0c4c4", title: "Changes to Terms", text: "We may update these Terms & Conditions from time to time. Changes will be effective immediately after posting on this page." },
  { id: 15, icon: Headphones, accent: "#3b7a2a", bg: "#f0f7ec", border: "#c8dea8", title: "Contact Information", text: "For any questions about these Terms & Conditions, please contact us using the details provided below." },
];


function ClauseCard({ clause }: any) {
  const Icon = clause.icon;
  return (
    <div
      className="group relative rounded-2xl border bg-white p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: clause.border, boxShadow: `0 1px 8px ${clause.accent}10` }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 24px ${clause.accent}22`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 1px 8px ${clause.accent}10`; }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: clause.bg, border: `1.5px solid ${clause.border}` }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: clause.accent }} strokeWidth={1.8} />
        </div>
        <span className="text-[11px] font-black tracking-wider" style={{ color: clause.accent }}>
          {String(clause.id).padStart(2, "0")}
        </span>
      </div>
      <h3 className="text-[14px] sm:text-[15px] font-black text-gray-900 mb-2 leading-snug">{clause.title}</h3>
      <p className="text-[12px] sm:text-[13px] text-gray-500 leading-relaxed">{clause.text}</p>
      <div
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: clause.accent }}
      />
    </div>
  );
}

function ContactCard() {
  return (
    <div
      className="mt-4 rounded-2xl border border-[#c8dea8] bg-[#f8fdf5] p-5 sm:p-8"
      style={{ boxShadow: "0 2px 16px rgba(59,122,42,0.08)" }}
    >
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
        <div className="flex items-start gap-4 flex-shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#e6f4e0] border border-[#c8dea8] flex items-center justify-center flex-shrink-0">
            <Headphones className="h-7 w-7 text-[#3b7a2a]" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-[16px] sm:text-[18px] font-black text-[#1a3d10] mb-1">Contact Us</h3>
            <p className="text-[12px] sm:text-[13px] text-gray-500 max-w-[220px]">
              For any questions about these Terms &amp; Conditions, please contact us.
            </p>
          </div>
        </div>
        <div className="hidden sm:block w-px self-stretch bg-[#daeecf]" />
        <div className="flex flex-col gap-3 flex-1">
          <a href="mailto:info@untappednature.com" className="inline-flex items-center gap-3 text-[13px] font-semibold text-gray-700 hover:text-[#3b7a2a] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#daeecf] flex items-center justify-center flex-shrink-0">
              <Mail className="h-3.5 w-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
            </div>
            info@untappednature.com
          </a>
          <a href="tel:+917096712340" className="inline-flex items-center gap-3 text-[13px] font-semibold text-gray-700 hover:text-[#3b7a2a] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#daeecf] flex items-center justify-center flex-shrink-0">
              <Phone className="h-3.5 w-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
            </div>
            +91 70967 12340
          </a>
          <div className="inline-flex items-start gap-3 text-[13px] text-gray-600">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#daeecf] flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
            </div>
            <span>Karnavati Kamdhenu Gaushala, Mota Vas, sanoda,<br />Gandhinagar, Gujarat, India</span>
          </div>
          <div className="inline-flex items-center gap-3 text-[13px] text-gray-600">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#daeecf] flex items-center justify-center flex-shrink-0">
              <span className="text-[13px]">🕐</span>
            </div>
            Mon – Sat : 9:00 AM – 6:00 PM
          </div>
        </div>
      </div>
    </div>
  );
}

function NeedHelpBanner() {
  return (
    <div className="mt-4 relative overflow-hidden rounded-2xl bg-[#1a3d10] px-5 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#3b7a2a] opacity-20 pointer-events-none" />
      <div className="absolute -bottom-6 right-16 w-20 h-20 rounded-full bg-[#3b7a2a] opacity-10 pointer-events-none" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#3b7a2a] flex items-center justify-center flex-shrink-0">
          <Headphones className="h-6 w-6 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-[14px] sm:text-[16px] font-black text-white leading-snug">Need Help?</p>
          <p className="text-[11px] sm:text-[12px] text-[#a8c89a] mt-0.5 max-w-[320px]">
            If you have any questions, our support team is here to help.
          </p>
        </div>
      </div>
      <Link
        href="/contact"
        className="relative z-10 flex-shrink-0 inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-black text-[#1a3d10] bg-white hover:bg-[#f0f7ec] rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 transition-all w-full sm:w-auto justify-center"
      >
        Contact Us <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default function TermsAndConditionsPage() {
  return (
    <UserLayout>
      <div className="min-h-screen bg-white text-gray-800 font-sans">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-[#f5faf2]">
          <div
            className="absolute top-0 right-0 hidden sm:block sm:w-[480px] md:w-[640px] lg:w-[760px] h-full pointer-events-none select-none"
            style={{
              maskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 70%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 70%, transparent 100%)",
            }}
          >
            <img
              src="/privacyPolicyImage.jpeg"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-contain object-right"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-10 md:pt-14 pb-6 sm:pb-8 md:pb-10">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-black tracking-widest text-[#3b7a2a] uppercase bg-[#eaf2e6] border border-[#c8dea8] rounded-full px-3 py-1.5 mb-5 sm:mb-6">
              <Shield className="h-3 w-3" strokeWidth={2} />
              Know Your Rights
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a3d10] leading-tight mb-4 sm:mb-5 tracking-tight max-w-[520px]"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Terms &amp; Conditions
            </h1>
            <p className="text-gray-500 text-[13px] sm:text-[14px] leading-relaxed mb-5 sm:mb-6 max-w-[400px]">
              Please read these terms and conditions carefully before using our website or placing any orders.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
                <FileText className="h-3.5 w-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
                Last Updated: 29 May 2026
              </div>
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
                Effective Immediately
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="relative z-10 border-t border-[#e0edd8] bg-white">
            <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 py-2.5 sm:py-3">
              <nav className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-gray-400 flex-wrap">
                <Link href="/" className="hover:text-[#3b7a2a] transition-colors flex items-center gap-1">
                  <Home className="h-3 w-3" /> Home
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-600 font-medium">Terms &amp; Conditions</span>
              </nav>
            </div>
          </div>
        </section>

        {/* ── CLAUSES ── */}
        <section className="py-10 sm:py-12 md:py-16 bg-white">
          <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12">
            <div className="max-w-[960px] mx-auto">

              {/* Section header */}
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e0edd8]" />
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#3b7a2a]" fill="currentColor">
                      <path d="M8 1C4 1 1 5 1 9c0 3 2 5 7 6C13 14 15 12 15 9 15 5 12 1 8 1z" opacity="0.4" />
                    </svg>
                    <span className="text-[11px] font-black tracking-widest text-[#3b7a2a] uppercase">15 Clauses</span>
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#3b7a2a]" fill="currentColor">
                      <path d="M8 1C4 1 1 5 1 9c0 3 2 5 7 6C13 14 15 12 15 9 15 5 12 1 8 1z" opacity="0.4" />
                    </svg>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e0edd8]" />
                </div>
                <p className="text-center text-[12px] sm:text-[13px] text-gray-400 max-w-[460px] mx-auto">
                  These terms govern your use of Untapped Nature&apos;s website and services.
                </p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {clauses.map(clause => <ClauseCard key={clause.id} clause={clause} />)}
              </div>

              <ContactCard />
              <NeedHelpBanner />

            </div>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}
