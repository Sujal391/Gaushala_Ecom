"use client";

import UserLayout from '../../components/layout/UserLayout';
import Link from 'next/link';
import {
    Mail, Phone, MapPin, ChevronRight, ShoppingBag,
    User, Database, CreditCard, Cookie, Users,
    FolderOpen, Lock, UserCog, ExternalLink,
    Baby, FileText, Bell, Shield,
} from 'lucide-react';

// ── Policy Data ──────────────────────────────────────────────────────────────

const policies = [
    {
        id: 1,
        title: "Information We Collect",
        icon: User,
        accent: "#3b7a2a",
        bg: "#f0f7ec",
        border: "#c8dea8",
        content: "We collect personal information you provide (name, email, phone, address, etc.) and automatically collected data like IP address, browser type, and device information.",
    },
    {
        id: 2,
        title: "How We Use Information",
        icon: Database,
        accent: "#2d6e8e",
        bg: "#eef6fb",
        border: "#b8d9ea",
        content: "We use your information to process orders, provide customer support, improve our services, send updates, prevent fraud, and comply with legal obligations.",
    },
    {
        id: 3,
        title: "Payment Security",
        icon: CreditCard,
        accent: "#6b3a8a",
        bg: "#f7f0fc",
        border: "#d9bff0",
        content: "All payments are processed securely through trusted third-party gateways. We do not store your card details, UPI PINs, or banking passwords.",
    },
    {
        id: 4,
        title: "Cookies & Tracking",
        icon: Cookie,
        accent: "#7a5c2a",
        bg: "#fdf6ee",
        border: "#e8d4b4",
        content: "We use cookies and similar technologies to improve your browsing experience, analyze traffic, and personalize content. You can manage cookies through your browser settings.",
    },
    {
        id: 5,
        title: "Sharing of Information",
        icon: Users,
        accent: "#6b3a8a",
        bg: "#f7f0fc",
        border: "#d9bff0",
        content: "We do not sell or rent your personal information. We may share it only with trusted service providers and when required by law or legal authorities.",
    },
    {
        id: 6,
        title: "Data Retention",
        icon: FolderOpen,
        accent: "#3b7a2a",
        bg: "#f0f7ec",
        border: "#c8dea8",
        content: "We retain your information only as long as necessary for transactions, legal obligations, and resolving disputes. Afterwards, it is securely deleted or anonymized.",
    },
    {
        id: 7,
        title: "Data Security",
        icon: Lock,
        accent: "#2d6e8e",
        bg: "#eef6fb",
        border: "#b8d9ea",
        content: "We implement industry-standard security measures to protect your data from unauthorized access, loss, misuse, or disclosure.",
    },
    {
        id: 8,
        title: "Your Rights",
        icon: UserCog,
        accent: "#7a5c2a",
        bg: "#fdf6ee",
        border: "#e8d4b4",
        content: "You have the right to access, correct, delete your personal data and withdraw consent for marketing communications anytime.",
    },
    {
        id: 9,
        title: "Third-Party Links",
        icon: ExternalLink,
        accent: "#8a3a3a",
        bg: "#fdf0f0",
        border: "#f0c4c4",
        content: "Our website may contain links to third-party websites. We are not responsible for their content or privacy practices.",
    },
    {
        id: 10,
        title: "Children's Privacy",
        icon: Baby,
        accent: "#8a3a3a",
        bg: "#fdf0f0",
        border: "#f0c4c4",
        content: "Our services are not intended for children under 18. We do not knowingly collect personal information from minors.",
    },
    {
        id: 11,
        title: "Changes to This Policy",
        icon: FileText,
        accent: "#2d6e8e",
        bg: "#eef6fb",
        border: "#b8d9ea",
        content: "We may update this Privacy Policy from time to time. Changes will be effective immediately after posting on this page.",
    },
    {
        id: 12,
        title: "Contact Us",
        icon: Bell,
        accent: "#6b3a8a",
        bg: "#f7f0fc",
        border: "#d9bff0",
        content: "If you have any questions about this Privacy Policy, feel free to reach out to us anytime.",
    },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function PolicyCard({ policy }: any) {
    const Icon = policy.icon;

    return (
        <div
            className="group relative rounded-2xl border bg-white p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5"
            style={{
                borderColor: policy.border,
                boxShadow: `0 1px 8px ${policy.accent}10`,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 6px 24px ${policy.accent}22`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = `0 1px 8px ${policy.accent}10`;
            }}
        >
            {/* Top row: icon + number */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: policy.bg, border: `1.5px solid ${policy.border}` }}
                >
                    <Icon className="h-[18px] w-[18px]" style={{ color: policy.accent }} strokeWidth={1.8} />
                </div>
                <span
                    className="text-[11px] font-black tracking-wider"
                    style={{ color: policy.accent }}
                >
                    {String(policy.id).padStart(2, '0')}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-[14px] sm:text-[15px] font-black text-gray-900 mb-2 leading-snug">
                {policy.title}
            </h3>

            {/* Content */}
            <p className="text-[12px] sm:text-[13px] text-gray-500 leading-relaxed">
                {policy.content}
            </p>

            {/* Hover left accent bar */}
            <div
                className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: policy.accent }}
            />
        </div>
    );
}

function GetInTouchCard() {
    return (
        <div
            className="mt-4 rounded-2xl border border-[#c8dea8] bg-[#f8fdf5] p-5 sm:p-6 sm:p-8"
            style={{ boxShadow: '0 2px 16px rgba(59,122,42,0.08)' }}
        >
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">

                {/* Left: illustration + heading */}
                <div className="flex items-start gap-4 flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#e6f4e0] border border-[#c8dea8] flex items-center justify-center flex-shrink-0">
                        <Mail className="h-7 w-7 text-[#3b7a2a]" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-[16px] sm:text-[18px] font-black text-[#1a3d10] mb-1">
                            Get in Touch
                        </h3>
                        <p className="text-[12px] sm:text-[13px] text-gray-500 max-w-[220px]">
                            We&apos;re here to help you with any questions about your privacy and data.
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px self-stretch bg-[#daeecf]" />

                {/* Right: contact details */}
                <div className="flex flex-col gap-3 flex-1">

                    <a
                        href="mailto:info@untappednature.com"
                        className="inline-flex items-center gap-3 text-[13px] font-semibold text-gray-700 hover:text-[#3b7a2a] transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#daeecf] flex items-center justify-center flex-shrink-0">
                            <Mail className="h-3.5 w-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
                        </div>
                        info@untappednature.com
                    </a>

                    <a
                        href="tel:+917096712340"
                        className="inline-flex items-center gap-3 text-[13px] font-semibold text-gray-700 hover:text-[#3b7a2a] transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#daeecf] flex items-center justify-center flex-shrink-0">
                            <Phone className="h-3.5 w-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
                        </div>
                        +91 70967 12340
                    </a>

                    <div className="inline-flex items-start gap-3 text-[13px] text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#daeecf] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MapPin className="h-3.5 w-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
                        </div>
                        <span>
                            Karnavati Kamdhenu Gaushala, Mota Vas, sanoda,<br />
                            Gandhinagar, Gujarat, India
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
}

function TrustBanner() {
    return (
        <div
            className="mt-4 relative overflow-hidden rounded-2xl bg-[#1a3d10] px-5 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
            {/* Decorative leaf circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#3b7a2a] opacity-20 pointer-events-none" />
            <div className="absolute -bottom-6 right-16 w-20 h-20 rounded-full bg-[#3b7a2a] opacity-10 pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#3b7a2a] flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" strokeWidth={1.8} />
                </div>
                <div>
                    <p className="text-[14px] sm:text-[16px] font-black text-white leading-snug">
                        Your Trust is Our Priority
                    </p>
                    <p className="text-[11px] sm:text-[12px] text-[#a8c89a] mt-0.5 max-w-[320px]">
                        We are committed to keeping your information safe and using it responsibly to serve you better.
                    </p>
                </div>
            </div>

            <Link
                href="/shop"
                className="relative z-10 flex-shrink-0 inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-black text-[#1a3d10] bg-white hover:bg-[#f0f7ec] rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 transition-all w-full sm:w-auto justify-center"
            >
                Shop Now
                <ChevronRight className="h-3.5 w-3.5" />
            </Link>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
    return (
        <UserLayout>
            <div className="min-h-screen bg-white text-gray-800 font-sans">

                {/* ── HERO ─────────────────────────────────────────────────── */}
                <section className="relative overflow-hidden bg-[#f5faf2]">

                    {/* Leaf image — right side */}
                    <div
                        className="absolute top-0 right-0 hidden sm:block sm:w-[400px] md:w-[540px] lg:w-[660px] h-full pointer-events-none select-none"
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

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-black tracking-widest text-[#3b7a2a] uppercase bg-[#eaf2e6] border border-[#c8dea8] rounded-full px-3 py-1.5 mb-5 sm:mb-6">
                            <Shield className="h-3 w-3" strokeWidth={2} />
                            Your Privacy Matters
                        </div>

                        {/* Heading */}
                        <h1
                            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a3d10] leading-tight mb-4 sm:mb-5 tracking-tight max-w-[480px]"
                            style={{ fontFamily: "'Georgia', serif" }}
                        >
                            Privacy Policy
                        </h1>

                        {/* Description */}
                        <p className="text-gray-500 text-[13px] sm:text-[14px] leading-relaxed mb-5 sm:mb-6 max-w-[400px]">
                            At Untapped Nature, we respect your privacy and are committed to protecting
                            your personal information. This policy explains how we collect, use, and
                            safeguard your data.
                        </p>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
                                <svg className="h-3.5 w-3.5 text-[#3b7a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                Last Updated: 29 May 2026
                            </div>
                            <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
                                <Shield className="h-3.5 w-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
                                Effective Immediately
                            </div>
                        </div>
                    </div>

                    {/* Breadcrumb strip */}
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
                                <span className="text-gray-600 font-medium">Privacy Policy</span>
                            </nav>
                        </div>
                    </div>
                </section>

                {/* ── POLICY GRID ──────────────────────────────────────────── */}
                <section className="py-10 sm:py-12 md:py-16 bg-white">
                    <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12">
                        <div className="max-w-[960px] mx-auto">

                            {/* Section header */}
                            <div className="mb-8 sm:mb-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e0edd8]" />
                                    <div className="flex items-center gap-2">
                                        {/* Small leaf icons flanking text */}
                                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#3b7a2a]" fill="currentColor">
                                            <path d="M8 1C4 1 1 5 1 9c0 3 2 5 7 6C13 14 15 12 15 9 15 5 12 1 8 1z" opacity="0.4" />
                                        </svg>
                                        <span className="text-[11px] font-black tracking-widest text-[#3b7a2a] uppercase">
                                            Our Commitment
                                        </span>
                                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#3b7a2a]" fill="currentColor">
                                            <path d="M8 1C4 1 1 5 1 9c0 3 2 5 7 6C13 14 15 12 15 9 15 5 12 1 8 1z" opacity="0.4" />
                                        </svg>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e0edd8]" />
                                </div>
                                <p className="text-center text-[12px] sm:text-[13px] text-gray-400 max-w-[460px] mx-auto">
                                    We follow industry-standard practices to ensure the security, transparency,
                                    and responsible use of your personal information.
                                </p>
                            </div>

                            {/* Policy cards — 3 column grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {policies.map(policy => (
                                    <PolicyCard key={policy.id} policy={policy} />
                                ))}
                            </div>

                            {/* Get in Touch card */}
                            <GetInTouchCard />

                            {/* Trust banner */}
                            <TrustBanner />

                        </div>
                    </div>
                </section>

            </div>
        </UserLayout>
    );
}
