"use client";

import Link from "next/link";
import UserLayout from "../../components/layout/UserLayout";
import {
    FileText, Mail, Phone, MapPin,
    Shield, CheckCircle2, Home, ChevronRight,
    Headphones, CreditCard, Calendar, ClipboardList,
    Clock, XCircle, IndianRupee, MessageCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PolicyItem {
    id: number;
    icon: React.ElementType;
    title: string;
    text?: string;
    list?: string[];
    highlight?: { before: string; value: string; after?: string };
    contact?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const policyItems: PolicyItem[] = [
    {
        id: 1,
        icon: ClipboardList,
        title: "Order Cancellation Eligibility",
        text: "Orders may be cancelled if they have not yet been dispatched from our warehouse. Customers can request cancellation before the order enters the shipping process.",
    },
    {
        id: 2,
        icon: Clock,
        title: "Cancellation Timeline",
        highlight: {
            before: "Cancellation requests must be submitted within",
            value: "24 hours",
            after: "of placing the order or before dispatch, whichever occurs first.",
        },
    },
    {
        id: 3,
        icon: XCircle,
        title: "Non-Cancellable Orders",
        text: "The following orders cannot be cancelled:",
        list: [
            "Orders already dispatched",
            "Delivered orders",
            "Customized or special-order products",
            "Products purchased during non-cancellable promotional campaigns",
        ],
    },
    {
        id: 4,
        icon: Mail,
        title: "How to Request Cancellation",
        text: "To cancel an order, customers may contact our support team with the following details:",
        list: ["Order Number", "Registered Email Address", "Registered Mobile Number"],
    },
    {
        id: 5,
        icon: IndianRupee,
        title: "Refund After Cancellation",
        text: "If a cancellation request is approved, the refund will be processed to the original payment method used during the purchase.",
    },
    {
        id: 6,
        icon: Calendar,
        title: "Refund Timeline After Cancellation",
        highlight: {
            before: "Approved cancellation refunds will be processed within",
            value: "5 – 7 business days",
            after: "The time taken may vary depending on your bank or payment provider.",
        },
    },
    {
        id: 7,
        icon: Headphones,
        title: "Contact Us",
        text: "For cancellation requests or any assistance, please contact our support team.",
        contact: true,
    },
];

// ─── PolicyRow ────────────────────────────────────────────────────────────────
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
                {/* Title */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-black text-[#3b7a2a] bg-[#f0f7ec] border border-[#c8dea8] rounded-md px-2 py-0.5 leading-none">
                        {String(item.id).padStart(2, "0")}
                    </span>
                    <h3 className="text-[14px] sm:text-[15px] font-black text-gray-900 leading-snug">
                        {item.title}
                    </h3>
                </div>

                {/* Highlight */}
                {item.highlight && (
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-1">
                        {item.highlight.before}{" "}
                        <span className="text-[#2d7a3a] font-bold">{item.highlight.value}</span>
                        {item.highlight.after ? ` ${item.highlight.after}` : ""}
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
                            <li
                                key={point}
                                className="flex items-start gap-2 text-[13px] text-gray-500 leading-relaxed"
                            >
                                <span className="text-[#3b7a2a] font-black text-[15px] leading-[1.4] flex-shrink-0">
                                    •
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Contact row */}
                {item.contact && (
                    <div className="mt-4 flex flex-wrap gap-3">
                        <a
                            href="mailto:info@untappednature.com"
                            className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold text-gray-600 hover:text-[#3b7a2a] transition-colors border border-gray-200 rounded-xl px-3 py-2 bg-white hover:border-[#c8dea8]"
                        >
                            <span className="w-6 h-6 rounded-lg bg-[#f0f7ec] border border-[#c8dea8] flex items-center justify-center flex-shrink-0">
                                <Mail className="w-3 h-3 text-[#3b7a2a]" strokeWidth={2} />
                            </span>
                            info@untappednature.com
                        </a>
                        <a
                            href="tel:+917096712340"
                            className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold text-gray-600 hover:text-[#3b7a2a] transition-colors border border-gray-200 rounded-xl px-3 py-2 bg-white hover:border-[#c8dea8]"
                        >
                            <span className="w-6 h-6 rounded-lg bg-[#f0f7ec] border border-[#c8dea8] flex items-center justify-center flex-shrink-0">
                                <Phone className="w-3 h-3 text-[#3b7a2a]" strokeWidth={2} />
                            </span>
                            +91 70967 12340
                        </a>
                        <span className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] text-gray-500 border border-gray-200 rounded-xl px-3 py-2 bg-white">
                            <span className="w-6 h-6 rounded-lg bg-[#f0f7ec] border border-[#c8dea8] flex items-center justify-center flex-shrink-0">
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

// ─── Still Have Questions Banner ──────────────────────────────────────────────
function StillHaveQuestionsBanner() {
    return (
        <div className="mt-5 relative overflow-hidden rounded-2xl border border-[#c8dea8] bg-[#f8fdf5] px-6 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Decorative leaf image — right */}
            <div
                className="absolute top-0 right-0 w-[120px] sm:w-[160px] h-full pointer-events-none select-none"
                style={{
                    maskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 20%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 20%, transparent 100%)",
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

            {/* Left */}
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#e6f4e0] border border-[#c8dea8] flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-7 h-7 text-[#3b7a2a]" strokeWidth={1.6} />
                </div>
                <div>
                    <p className="text-[15px] sm:text-[16px] font-black text-[#1a3d10] leading-snug">
                        Still have questions?
                    </p>
                    <p className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5">
                        Our support team is here to help you.
                    </p>
                </div>
            </div>

            {/* Button */}
            <Link
                href="/contact"
                className="relative z-10 flex-shrink-0 inline-flex items-center justify-center gap-2 text-[12px] sm:text-[13px] font-black text-white bg-[#2d7a3a] hover:bg-[#1a3d10] rounded-xl px-5 py-3 transition-all w-full sm:w-auto"
            >
                Contact Us
                <ChevronRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CancellationPolicyPage() {
    return (
        <UserLayout>
            <div className="min-h-screen bg-white text-gray-800 font-sans">


                {/* ══════════════ HERO ══════════════ */}
                <section className="relative overflow-hidden bg-[#f0f7ea]">

                    {/* Decorative leaf image — blended */}
                    <div
                        className="absolute top-0 right-0 hidden sm:block sm:w-[400px] md:w-[520px] lg:w-[620px] h-full pointer-events-none select-none"
                        style={{
                            maskImage:
                                "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 70%, transparent 100%)",
                            WebkitMaskImage:
                                "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 70%, transparent 100%)",
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
                    <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-10 md:pb-12">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-black tracking-widest text-[#3b7a2a] uppercase bg-white border border-[#c8dea8] rounded-full px-3 py-1.5 mb-5 sm:mb-6">
                            <Shield className="w-3 h-3" strokeWidth={2} />
                            Know Before You Cancel
                        </div>

                        {/* Title */}
                        <h1
                            className="text-4xl sm:text-5xl md:text-[56px] font-black text-[#1a3d10] leading-tight tracking-tight mb-4 max-w-[560px]"
                            style={{ fontFamily: "'Georgia', serif" }}
                        >
                            Cancellation Policy
                        </h1>

                        {/* Description */}
                        <p className="text-gray-500 text-[13px] sm:text-[14px] leading-relaxed mb-5 max-w-[420px]">
                            We understand that you may need to cancel an order at times.
                            Please read our cancellation policy carefully.
                        </p>

                        {/* Last updated pill */}
                        <div className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold text-[#3b7a2a]">
                            <Calendar className="w-4 h-4" strokeWidth={1.8} />
                            <span>
                                <span className="font-black">Last Updated:</span> 29 May 2026
                            </span>
                        </div>
                    </div>

                    {/* White breadcrumb strip — matches Refund & Privacy pages */}
                    <div className="relative z-10 border-t border-[#e0edd8] bg-white">
                        <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 py-2.5 sm:py-3">
                            <nav className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-gray-400 flex-wrap">
                                <Link href="/" className="hover:text-[#3b7a2a] transition-colors flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                    Home
                                </Link>
                                <ChevronRight className="h-3 w-3" />
                                <span className="text-gray-600 font-medium">Cancellation Policy</span>
                            </nav>
                        </div>
                    </div>
                </section>

                {/* ══════════════ CONTENT ══════════════ */}
                <section className="pt-8 sm:pt-10 md:pt-14 pb-5 sm:pb-6 md:pb-8 bg-white">
                    <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12">
                        <div className="max-w-[860px] mx-auto">

                            {/* Policy card */}
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                {policyItems.map((item) => (
                                    <PolicyRow key={item.id} item={item} />
                                ))}
                            </div>

                            {/* Still have questions banner */}
                            <StillHaveQuestionsBanner />

                        </div>
                    </div>
                </section>

            </div>
        </UserLayout>
    );
}
