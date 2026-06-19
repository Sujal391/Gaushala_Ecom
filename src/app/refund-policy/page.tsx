"use client";

import Link from "next/link";
import UserLayout from "../../components/layout/UserLayout";
import {
  FileText, Mail, Phone, MapPin,
  Shield, CheckCircle2, Home, ChevronRight,
  Headphones, CreditCard, Calendar,
  UserCheck, XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PolicyItem {
  id: number;
  icon: React.ElementType;
  title: string;
  text?: string;
  list?: string[];
  highlight?: { text: string; value: string };
  contact?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const policyItems: PolicyItem[] = [
  {
    id: 1,
    icon: FileText,
    title: "Eligibility for Refund",
    text: "Refunds may be requested in the following situation:",
    list: [
      "Incorrect product received",
    ],
  },
  {
    id: 2,
    icon: XCircle,
    title: "Non-Refundable Situations",
    text: "Refunds will not be provided for:",
    list: [
      "Change of mind after purchase",
      "Products that have been used or opened",
      "Products returned without a valid reason",
      "Refund requests made after the allowed reporting period",
    ],
  },
  {
    id: 3,
    icon: Mail,
    title: "How to Request a Refund",
    text: "To request a refund, customers must contact our support team within 24 hours of receiving the order and provide the following information:",
    list: ["Order Number", "Product Images", "Description of the issue"],
  },
  {
    id: 4,
    icon: UserCheck,
    title: "Refund Approval Process",
    text: "Once we receive your request, our team will review the information and verify the issue. If your request meets our refund or replacement criteria, we will either issue a full refund to your original payment method, or send a replacement product at no additional cost. The final resolution will depend on the nature of the issue and product availability.",
  },
  {
    id: 5,
    icon: Calendar,
    title: "Refund Timeline",
    highlight: {
      text: "Approved refunds will be processed within",
      value: "5 – 7 business days",
    },
    text: "The refund amount will be credited to the original payment method used during the purchase.",
  },
  {
    id: 6,
    icon: CreditCard,
    title: "Refund Method",
    text: "Refunds will be issued only to the original payment method used while placing the order.",
  },
  {
    id: 7,
    icon: CreditCard,
    title: "Card Payment Refund Rule",
    text: "If a debit card, credit card, UPI, or any other online payment method was used for the purchase, the refund will be credited back to the same payment method used for the original transaction.",
  },
  {
    id: 8,
    icon: Headphones,
    title: "Contact Us",
    text: "For any refund-related queries, please contact our support team.",
    contact: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PolicyRow({ item }: { item: PolicyItem }) {
  const Icon = item.icon;
  return (
    <div className="flex gap-5 items-start px-6 sm:px-8 py-6 border-b border-gray-100 last:border-b-0 hover:bg-[#fafefa] transition-colors duration-150">
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-[#e6f4e0] border border-[#c8dea8] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-[20px] h-[20px] text-[#3b7a2a]" strokeWidth={1.8} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-black text-[#3b7a2a] bg-[#f0f7ec] border border-[#c8dea8] rounded-md px-2 py-0.5 leading-none">
            {String(item.id).padStart(2, "0")}
          </span>
          <h3 className="text-[14px] sm:text-[15px] font-black text-gray-900 leading-snug">
            {item.title}
          </h3>
        </div>

        {/* Highlight line (Timeline) */}
        {item.highlight && (
          <p className="text-[13px] text-gray-500 leading-relaxed mb-1">
            {item.highlight.text}{" "}
            <span className="text-[#2d7a3a] font-bold">{item.highlight.value}</span>.
          </p>
        )}

        {/* Text */}
        {item.text && (
          <p className="text-[13px] text-gray-500 leading-relaxed">
            {item.text}
          </p>
        )}

        {/* Bullet list */}
        {item.list && (
          <ul className="mt-2 flex flex-col gap-1.5">
            {item.list.map((point) => (
              <li key={point} className="flex items-start gap-2 text-[13px] text-gray-500 leading-relaxed">
                <span className="text-[#3b7a2a] font-black text-[15px] leading-[1.4] flex-shrink-0">•</span>
                {point}
              </li>
            ))}
          </ul>
        )}

        {/* Contact details */}
        {item.contact && (
          <div className="mt-3 flex flex-wrap gap-4 sm:gap-6">
            <a
              href="mailto:info@untappednature.com"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-600 hover:text-[#3b7a2a] transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-[#f0f7ec] border border-[#c8dea8] flex items-center justify-center flex-shrink-0">
                <Mail className="w-3 h-3 text-[#3b7a2a]" strokeWidth={2} />
              </span>
              info@untappednature.com
            </a>
            <a
              href="tel:+917096712340"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-600 hover:text-[#3b7a2a] transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-[#f0f7ec] border border-[#c8dea8] flex items-center justify-center flex-shrink-0">
                <Phone className="w-3 h-3 text-[#3b7a2a]" strokeWidth={2} />
              </span>
              +91 70967 12340
            </a>
            <span className="inline-flex items-center gap-2 text-[13px] text-gray-500">
              <span className="w-7 h-7 rounded-lg bg-[#f0f7ec] border border-[#c8dea8] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3 h-3 text-[#3b7a2a]" strokeWidth={2} />
              </span>
              Karnavati Kamdhenu Gaushala, Mota Vas, sanoda, Gandhinagar, Gujarat, India
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function StillNeedHelpBanner() {
  return (
    <div className="mt-5 relative overflow-hidden rounded-2xl bg-[#1a3d10] px-6 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#3b7a2a] opacity-20 pointer-events-none" />
      <div className="absolute -bottom-6 right-16 w-20 h-20 rounded-full bg-[#3b7a2a] opacity-10 pointer-events-none" />

      {/* Left */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#3b7a2a] flex items-center justify-center flex-shrink-0">
          <Headphones className="w-6 h-6 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-[15px] sm:text-[16px] font-black text-white leading-snug">
            Still need help?
          </p>
          <p className="text-[11px] sm:text-[12px] text-[#a8c89a] mt-0.5">
            Our support team is here to assist you.
          </p>
        </div>
      </div>

      {/* Button */}
      <Link
        href="/contact"
        className="relative z-10 flex-shrink-0 inline-flex items-center justify-center gap-2 text-[12px] sm:text-[13px] font-black text-[#1a3d10] bg-white hover:bg-[#f0f7ec] rounded-xl px-5 py-3 transition-all w-full sm:w-auto"
      >
        Contact Us <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RefundPolicyPage() {
  return (
    <UserLayout>
      <div className="min-h-screen bg-white text-gray-800 font-sans">

        {/* ══════════════ HERO ══════════════ */}
        <section className="relative overflow-hidden bg-[#f0f7ea]">

          {/* Decorative leaf image — blended seamlessly into bg */}
          <div
            className="absolute top-0 right-0 hidden sm:block sm:w-[400px] md:w-[540px] lg:w-[660px] h-full pointer-events-none select-none"
            style={{
              maskImage:
                "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0.5) 65%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0.5) 65%, transparent 100%)",
            }}
          >
            <img
              src="/refundPolicyImage1.jpeg"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-contain object-right"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          {/* Hero content */}
          <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-10 md:pt-14 pb-6 sm:pb-8 md:pb-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-black tracking-widest text-[#3b7a2a] uppercase bg-white border border-[#c8dea8] rounded-full px-3 py-1.5 mb-5 sm:mb-6">
              <Shield className="w-3 h-3" strokeWidth={2} />
              Customer Protection
            </div>

            {/* Title */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a3d10] leading-tight tracking-tight mb-3 sm:mb-4 max-w-[520px]"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Refund Policy
            </h1>

            {/* Underline accent */}
            <div className="w-12 h-[3px] bg-[#3b7a2a] rounded-full mb-4 sm:mb-5" />

            {/* Description */}
            <p className="text-gray-500 text-[13px] sm:text-[14px] leading-relaxed mb-5 sm:mb-6 max-w-[420px]">
              At Untapped Nature, customer satisfaction is important to us. This Refund Policy explains
              the conditions under which refunds may be issued for products purchased through our website.
            </p>

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
                <FileText className="w-3.5 h-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
                Last Updated: 29 May 2026
              </div>
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
                Effective Immediately
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="relative z-10 border-t border-[#e0edd8] bg-white">
            <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 py-2.5 sm:py-3">
              <nav className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-gray-400 flex-wrap">
                <Link href="/" className="hover:text-[#3b7a2a] transition-colors flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  Home
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-600 font-semibold">Refund Policy</span>
              </nav>
            </div>
          </div>
        </section>

        {/* ══════════════ CONTENT ══════════════ */}
        <section className="pt-10 sm:pt-12 md:pt-16 pb-5 sm:pb-6 md:pb-8 bg-white">
          <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12">
            <div className="max-w-[860px] mx-auto">

              {/* Policy card */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {policyItems.map((item) => (
                  <PolicyRow key={item.id} item={item} />
                ))}
              </div>

              {/* Still need help banner */}
              <StillNeedHelpBanner />

            </div>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}
