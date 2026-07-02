"use client";

import { useRouter } from "next/navigation";
import UserLayout from '../../components/layout/UserLayout';
import { useEffect, useRef } from "react";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    ShieldCheck,
    Users,
    Zap,
    MessageCircle,
    ChevronRight,
    Lock,
    Leaf,
    Star,
    CheckCircle2,
    FlaskConical, Package, Search, RotateCcw, Wallet, CreditCard, Building2,
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [openFaqLeft, setOpenFaqLeft] = useState<number | null>(null);
    const [openFaqRight, setOpenFaqRight] = useState<number | null>(null);
    const [subjectOpen, setSubjectOpen] = useState(false);
    const subjectRef = useRef<HTMLDivElement>(null);

    const subjectOptions = [
        { value: "product", label: "Product Inquiry" },
        { value: "order", label: "Order Support" },
        { value: "returns", label: "Returns & Refunds" },
        { value: "wholesale", label: "Wholesale / Bulk" },
        { value: "other", label: "Other" },
    ];


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (subjectRef.current && !subjectRef.current.contains(e.target as Node)) {
                setSubjectOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const faqs = [
        // LEFT COLUMN (0–3)
        {
            q: "What is Untapped Nature?",
            a: "Untapped Nature is committed to offering high-quality natural and organic products made from carefully selected ingredients. We believe in promoting healthier lifestyles through nature-inspired solutions.",
            Icon: Leaf,
            iconBg: "#eaf2e6", iconColor: "#3b7a2a",
            tag: "About", tagColor: "#3b6d11", tagBg: "#eaf2e6",
        },
        {
            q: "Are your products 100% natural?",
            a: "Yes. Our products are made using carefully sourced natural ingredients and are free from harmful chemicals, artificial colors, and unnecessary additives whenever possible. Each product page provides detailed ingredient information.",
            Icon: FlaskConical,
            iconBg: "#eaf2e6", iconColor: "#3b7a2a",
            tag: "Products", tagColor: "#3b6d11", tagBg: "#eaf2e6",
        },
        {
            q: "How long does delivery take?",
            a: "Orders are typically delivered within 3–7 business days across India. Delivery times may vary depending on your location. Once your order is shipped, you'll receive a tracking link via SMS or email.",
            Icon: Package,
            iconBg: "#e8f4fd", iconColor: "#2980b9",
            tag: "Orders", tagColor: "#185fa5", tagBg: "#e8f4fd",
        },
        {
            q: "How can I track my order?",
            a: "After your order is dispatched, you'll receive a tracking link via email or SMS. You can also log in to your account and track your order anytime from the My Orders section.",
            Icon: Search,
            iconBg: "#e8f4fd", iconColor: "#2980b9",
            tag: "Orders", tagColor: "#185fa5", tagBg: "#e8f4fd",
        },
        // RIGHT COLUMN (4–7)
        {
            q: "Can I cancel or modify my order?",
            a: "Yes. You can request to cancel or modify your order before it has been shipped. Once the order has been dispatched, cancellations or modifications may no longer be possible. Please contact our customer support team as soon as possible.",
            Icon: RotateCcw,
            iconBg: "#fdecea", iconColor: "#c0392b",
            tag: "Orders", tagColor: "#993c1d", tagBg: "#fdecea",
        },
        {
            q: "What payment methods do you accept?",
            a: "We accept UPI, Credit Cards, Debit Cards, Net Banking, and Digital Wallets. Cash on Delivery (COD) is currently not available. All payments are processed through secure and encrypted payment gateways.",
            Icon: CreditCard,
            iconBg: "#fef9e7", iconColor: "#c9a800",
            tag: "Payments", tagColor: "#854f0b", tagBg: "#fef9e7",
        },
        {
            q: "Are your products safe for daily use?",
            a: "Our products are formulated using natural ingredients and are generally safe when used as directed. If you have allergies, sensitive skin, or any medical condition, please review the ingredient list and consult your healthcare professional before use.",
            Icon: Wallet,
            iconBg: "#eaf2e6", iconColor: "#3b7a2a",
            tag: "Products", tagColor: "#3b6d11", tagBg: "#eaf2e6",
        },
        {
            q: "How can I contact customer support?",
            a: "You can reach our customer support team through the Contact Us page, email, or phone. We're here to assist you with product inquiries, orders, returns, and any other questions you may have.",
            Icon: Building2,
            iconBg: "#e8f4fd", iconColor: "#2980b9",
            tag: "Support", tagColor: "#185fa5", tagBg: "#e8f4fd",
        },
    ];

    return (
        <UserLayout>
            <div className="min-h-[85vh] bg-white text-gray-800 font-sans overflow-x-hidden">
                {/* ── KEYFRAMES ── */}
                <style>{`
                            @keyframes fadeUp {
                                from { opacity: 0; transform: translateY(28px); }
                                to   { opacity: 1; transform: translateY(0); }
                            }
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to   { opacity: 1; }
                            }
                            @keyframes slideRight {
                                from { opacity: 0; transform: translateX(30px) scale(0.97); }
                                to   { opacity: 1; transform: translateX(0) scale(1); }
                            }
                            @keyframes floatBadge {
                                0%, 100% { transform: translateY(0px) rotate(-1deg); }
                                50%       { transform: translateY(-10px) rotate(1deg); }
                            }
                            @keyframes floatLeaf {
                                0%, 100% { transform: translateY(0px) rotate(0deg); }
                                33%       { transform: translateY(-12px) rotate(8deg); }
                                66%       { transform: translateY(-6px) rotate(-5deg); }
                            }
                            @keyframes shimmer {
                                0%   { background-position: -200% center; }
                                100% { background-position: 200% center; }
                            }
                            @keyframes pulseRing {
                                0%, 100% { box-shadow: 0 0 0 0 rgba(59,122,42,0.25); }
                                50%       { box-shadow: 0 0 0 8px rgba(59,122,42,0); }
                            }
                            .anim-fade-up-1 { animation: fadeUp 0.65s cubic-bezier(.22,.68,0,1.2) forwards; animation-delay: 0.05s; opacity: 0; }
                            .anim-fade-up-2 { animation: fadeUp 0.65s cubic-bezier(.22,.68,0,1.2) forwards; animation-delay: 0.15s; opacity: 0; }
                            .anim-fade-up-3 { animation: fadeUp 0.65s cubic-bezier(.22,.68,0,1.2) forwards; animation-delay: 0.25s; opacity: 0; }
                            .anim-fade-up-4 { animation: fadeUp 0.65s cubic-bezier(.22,.68,0,1.2) forwards; animation-delay: 0.35s; opacity: 0; }
                            .anim-slide-right { animation: slideRight 0.8s cubic-bezier(.22,.68,0,1.2) forwards; animation-delay: 0.2s; opacity: 0; }
                            .anim-fade-in { animation: fadeIn 0.5s ease forwards; animation-delay: 0.1s; opacity: 0; }
                            .leaf-float-1 { animation: floatLeaf 6s ease-in-out infinite; }
                            .leaf-float-2 { animation: floatLeaf 8s ease-in-out infinite 1s; }
                            .leaf-float-3 { animation: floatLeaf 7s ease-in-out infinite 2.5s; }
                            .leaf-float-4 { animation: floatLeaf 9s ease-in-out infinite 0.5s; }
                            .badge-float  { animation: floatBadge 5s ease-in-out infinite 0.5s; }
                            .pulse-ring   { animation: pulseRing 2.5s ease-in-out infinite; }
                            .shimmer-btn  {
                                background: linear-gradient(90deg, #2d6a1f 0%, #3d8c2a 40%, #2d6a1f 60%, #1b3d13 100%);
                                background-size: 200% auto;
                                animation: shimmer 3s linear infinite;
                            }
                            .faq-answer {
                                max-height: 0;
                                overflow: hidden;
                                transition: max-height 0.35s cubic-bezier(.4,0,.2,1), opacity 0.25s ease, padding 0.25s ease;
                                opacity: 0;
                            }
                            .faq-answer.open {
                                max-height: 200px;  
                                opacity: 1;
                            }
                            input, textarea, select {
                                font-family: inherit;
                            }
                            input:focus, textarea:focus, select:focus {
                                outline: none;
                            }
                        `}</style>

                {/* ═══════════════════════════════════════════════════════════════
                            HERO SECTION
                        ═══════════════════════════════════════════════════════════════ */}
                <section className="relative w-full overflow-hidden min-h-[480px] flex items-center"
                    style={{ background: 'linear-gradient(135deg, #eaf5e3 0%, #f5faf2 45%, #e6f2de 100%)' }}>

                    {/* Decorative large circle — bg */}
                    <div className="absolute right-[-80px] top-[-80px] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #b5d99a 0%, transparent 70%)' }} />
                    <div className="absolute left-[-40px] bottom-[-60px] w-[300px] h-[300px] rounded-full opacity-10 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #6ab04c 0%, transparent 70%)' }} />

                    {/* Floating leaves */}
                    <span className="absolute top-[10%] left-[4%]  text-[30px] opacity-35 leaf-float-1 pointer-events-none select-none">🍃</span>
                    <span className="absolute top-[22%] left-[9%]  text-[22px] opacity-25 leaf-float-2 pointer-events-none select-none">🌿</span>
                    <span className="absolute bottom-[18%] left-[6%]  text-[20px] opacity-30 leaf-float-3 pointer-events-none select-none">🍃</span>
                    <span className="absolute top-[15%] left-[40%] text-[16px] opacity-20 leaf-float-4 pointer-events-none select-none">🌿</span>
                    <span className="absolute bottom-[25%] left-[45%] text-[14px] opacity-15 leaf-float-1 pointer-events-none select-none">🍃</span>
                    <span className="absolute top-[8%] left-[55%] text-[18px] opacity-15 leaf-float-2 pointer-events-none select-none">🌿</span>

                    <div className="relative z-10 w-full max-w-[1300px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-0 py-10 md:py-0 min-h-[480px]">

                        {/* LEFT: Text */}
                        <div className="flex-1 flex flex-col justify-center py-16 md:py-20 space-y-5 pr-0 md:pr-8">

                            <div className="anim-fade-up-1">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-[0.22em] uppercase text-[#3b7a2a] bg-white/80 border border-[#b5d99a]/60 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm">
                                    <Leaf className="h-3 w-3" />
                                    Contact Us
                                </span>
                            </div>

                            <h1 className="anim-fade-up-2 text-[1.9rem] sm:text-[2.6rem] md:text-[3.2rem] font-black text-[#1a3d10] leading-[1.08] tracking-tight max-w-[500px]"
                                style={{ fontFamily: "'Georgia', serif" }}>
                                We&apos;d Love To<br />
                                Hear{" "}
                                <span className="relative text-[#3b7a2a] italic">
                                    From You!
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 260 12" fill="none">
                                        <path d="M3 9 Q65 2 130 8 Q195 14 257 8" stroke="#6ab04c" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
                                    </svg>
                                </span>
                            </h1>

                            <p className="anim-fade-up-3 text-gray-500 text-[14.5px] leading-[1.7] max-w-[420px]">
                                Have questions about our products, your order, or anything else? Our team is here to help and we&apos;ll get back to you as soon as possible.
                            </p>

                            <div className="anim-fade-up-4">
                                <button
                                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="group relative inline-flex items-center gap-3 text-white text-[13px] font-black px-5 sm:px-8 py-3.5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl w-fit overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, #2d6a1f 0%, #3b8a28 50%, #24511a 100%)', boxShadow: '0 6px 24px rgba(45,106,31,0.35)' }}
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
                                    <Send className="h-4 w-4" />
                                    Send Us a Message
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: Photo */}
                        <div className="hidden md:flex flex-1 items-center justify-center relative h-[480px] anim-slide-right">

                            {/* Curved bg blob */}
                            <div className="absolute right-[-70px] top-0 bottom-0 w-[115%] rounded-[60%_0_0_60%/30%_0_0_30%] pointer-events-none"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(230,242,222,0.3) 100%)', borderLeft: '1.5px solid rgba(181,217,154,0.35)' }} />

                            {/* Hero photo — organic blob shape */}
                            <div className="relative z-10 w-[560px] h-[380px] overflow-hidden shadow-2xl"
                                style={{ borderRadius: '48% 52% 44% 56% / 46% 54% 50% 50%', boxShadow: '0 30px 70px rgba(26,61,16,0.18)' }}>
                                <img
                                    src="/contactus-hero-image.jpeg"
                                    alt="Natural products — mortar, essential oil, plants"
                                    className="absolute inset-0 w-full h-full object-cover object-center"
                                />
                                {/* Subtle overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#1a3d10]/10" />
                            </div>

                            {/* Floating badge */}
                            <div className="absolute right-[20px] top-[30px] z-20 badge-float">
                                <div className="bg-white rounded-2xl shadow-xl px-5 py-4 text-center border border-gray-100/80 max-w-[160px]"
                                    style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}>
                                    <div className="text-2xl mb-1">🌿</div>
                                    <p className="text-[12px] text-gray-500 leading-snug">We care</p>
                                    <p className="text-[12px] text-gray-500 leading-snug">for you and</p>
                                    <p className="text-[14px] font-black text-[#1a3d10] mt-0.5">nature</p>
                                </div>
                            </div>

                            {/* Small accent badge — bottom left of image */}
                            <div className="absolute left-[20px] bottom-[50px] z-20">
                                <div className="flex items-center gap-2 bg-[#1a3d10] text-white rounded-xl px-4 py-2.5 shadow-lg">
                                    <div className="w-7 h-7 rounded-full bg-[#6ab04c] flex items-center justify-center">
                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black tracking-wide">100% ORGANIC</p>
                                        <p className="text-[10px] text-green-300/80">Certified Natural</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                            CONTACT INFO BAR
                        ═══════════════════════════════════════════════════════════════ */}
                <section className="py-6 bg-white border-b border-gray-100/80">
                    <div className="w-full mx-auto max-w-[1300px] px-6 md:px-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                {
                                    icon: Phone,
                                    label: "Phone Number",
                                    value: "+91 70967 12340",
                                    hint: "Mon – Sat : 9 AM – 7 PM",
                                    bg: "#eaf2e6",
                                    iconColor: "#3b7a2a",
                                    accent: "#3b7a2a",
                                },
                                {
                                    icon: Mail,
                                    label: "Email Address",
                                    value: "info@untappednature.com",
                                    hint: "We reply within 24 hours",
                                    bg: "#e8f4fd",
                                    iconColor: "#2980b9",
                                    accent: "#2980b9",
                                },
                                {
                                    icon: MapPin,
                                    label: "Our Location",
                                    value: "Karnavati Kamdhenu Gaushala, Mota Vas, sanoda, Gandhinagar, Gujarat, India",
                                    hint: "Visit our office anytime",
                                    bg: "#fdecea",
                                    iconColor: "#c0392b",
                                    accent: "#c0392b",
                                },
                                {
                                    icon: Clock,
                                    label: "Working Hours",
                                    value: "Mon – Sat : 9 AM – 7 PM",
                                    hint: "Sunday Closed",
                                    bg: "#fef9e7",
                                    iconColor: "#c9a800",
                                    accent: "#c9a800",
                                },
                            ].map(({ icon: Icon, label, value, hint, bg, iconColor, accent }) => (
                                <div
                                    key={label}
                                    className="group flex items-start gap-3.5 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    style={{ '--accent': accent } as React.CSSProperties}
                                >
                                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                                        style={{ background: bg }}>
                                        <Icon className="h-5 w-5" style={{ color: iconColor }} strokeWidth={1.8} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                                        <p className="text-[11px] font-bold mt-0.5 leading-snug break-words" style={{ color: iconColor }}>{value}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                            CONTACT FORM SECTION
                        ═══════════════════════════════════════════════════════════════ */}
                <section id="contact-form" className="py-14"
                    style={{ background: 'linear-gradient(180deg, #f5faf2 0%, #edf6e8 50%, #f5faf2 100%)' }}>
                    <div className="w-full mx-auto max-w-[1300px] px-6 md:px-12">

                        {/* Section label */}
                        <div className="text-center mb-10">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#4a7c3f] bg-white rounded-full px-4 py-2 border border-[#b5d99a]/50 shadow-sm mb-4">
                                🌿 Get In Touch
                            </span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1a3d10] leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                                Send Us a{" "}
                                <span className="text-[#3b7a2a] italic relative">
                                    Message
                                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 160 8" fill="none">
                                        <path d="M2 6 Q40 1 80 5 Q120 9 158 5" stroke="#6ab04c" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
                                    </svg>
                                </span>
                            </h2>
                        </div>

                        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

                            {/* LEFT: Info card */}
                            <div className="md:col-span-4 relative">

                                {/* Plant decoration */}

                                <div className="bg-white rounded-3xl p-5 sm:p-8 h-full flex flex-col gap-6 relative overflow-hidden"
                                    style={{ boxShadow: '0 4px 24px rgba(26,61,16,0.08)', border: '1px solid rgba(181,217,154,0.3)' }}>

                                    {/* Subtle dot pattern */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                        style={{ backgroundImage: 'radial-gradient(circle, #3b7a2a 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />

                                    {/* Decorative top-right leaf accent */}
                                    <div className="absolute top-4 right-4 text-[40px] opacity-[0.06] pointer-events-none select-none rotate-[20deg]">🍃</div>

                                    <div className="relative z-10 flex flex-col gap-6">

                                        <div>
                                            <span className="inline-block bg-[#eaf2e6] text-[#3b602c] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-[#c8dfc0]/50 mb-4">
                                                Send Us a Message
                                            </span>
                                            <h3 className="text-2xl font-black text-[#1a3d10] leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                                                We&apos;re here<br />
                                                <span className="text-[#3b7a2a] italic">to help you</span> 🌿
                                            </h3>
                                            <p className="text-gray-500 text-[13px] leading-relaxed mt-3">
                                                Whether you have a question about our products, need help with an order, or just want to say hello — we&apos;re here for you.
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <div className="flex flex-col gap-4">
                                            {[
                                                { icon: MessageCircle, title: "Quick Response", desc: "We typically respond within 24 hours", color: "#eaf2e6", iconC: "#3b7a2a" },
                                                { icon: Users, title: "Friendly Support", desc: "Our team is always happy to help", color: "#e8f4fd", iconC: "#2980b9" },
                                                { icon: ShieldCheck, title: "Trusted & Secure", desc: "Your information is safe with us", color: "#eaf2e6", iconC: "#3b7a2a" },
                                                { icon: Star, title: "Customer First", desc: "Your satisfaction is our priority", color: "#fef9e7", iconC: "#c9a800" },
                                            ].map(({ icon: Icon, title, desc, color, iconC }) => (
                                                <div key={title} className="flex items-start gap-3.5 group">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                                                        style={{ background: color, border: '1px solid rgba(0,0,0,0.05)' }}>
                                                        <Icon className="h-4 w-4" style={{ color: iconC }} strokeWidth={1.8} />
                                                    </div>
                                                    <div className="pt-0.5">
                                                        <p className="text-[13px] font-bold text-gray-800 leading-tight">{title}</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Form */}
                            <div className="md:col-span-8 bg-white rounded-3xl p-5 sm:p-8 md:p-9 overflow-hidden"
                                style={{ boxShadow: '0 4px 30px rgba(26,61,16,0.08)', border: '1px solid rgba(181,217,154,0.25)' }}>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                                    {/* Row 1: Full Name + Email */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {[
                                            { label: "Full Name", key: "fullName", type: "text", placeholder: "Enter your full name", required: true },
                                            { label: "Email Address", key: "email", type: "email", placeholder: "Enter your email", required: true },
                                        ].map(({ label, key, type, placeholder, required }) => (
                                            <div key={key} className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-black text-gray-600 uppercase tracking-wider">
                                                    {label} {required && <span className="text-red-400 normal-case tracking-normal">*</span>}
                                                </label>
                                                <input
                                                    type={type}
                                                    placeholder={placeholder}
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    value={(formData as any)[key]}
                                                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#fafafa] text-[13px] text-gray-700 placeholder:text-gray-300 focus:border-[#6ab04c] focus:bg-white focus:ring-2 focus:ring-[#6ab04c]/15 transition-all duration-200"
                                                    required={required}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Row 2: Phone + Subject */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11px] font-black text-gray-600 uppercase tracking-wider">Phone Number</label>
                                            <input
                                                type="tel"
                                                placeholder="Enter your phone number"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#fafafa] text-[13px] text-gray-700 placeholder:text-gray-300 focus:border-[#6ab04c] focus:bg-white focus:ring-2 focus:ring-[#6ab04c]/15 transition-all duration-200"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5 relative" ref={subjectRef}>
                                            <label className="text-[11px] font-black text-gray-600 uppercase tracking-wider">
                                                Subject <span className="text-red-400 normal-case tracking-normal">*</span>
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setSubjectOpen(!subjectOpen)}
                                                    className={`w-full px-4 py-3.5 rounded-xl border text-[13px] text-left flex items-center justify-between transition-all duration-200 bg-[#fafafa]
                                                        ${subjectOpen
                                                            ? 'border-[#6ab04c] ring-2 ring-[#6ab04c]/15 bg-white'
                                                            : 'border-gray-200'
                                                        }
                                                                    ${formData.subject ? 'text-gray-700' : 'text-gray-400'}
                                                                `}
                                                >
                                                    {formData.subject
                                                        ? subjectOptions.find(o => o.value === formData.subject)?.label
                                                        : 'Select a subject'
                                                    }
                                                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${subjectOpen ? 'rotate-[270deg]' : 'rotate-90'}`} />
                                                </button>

                                                {subjectOpen && (
                                                    <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden"
                                                        style={{ boxShadow: '0 8px 30px rgba(26,61,16,0.12)' }}>
                                                        {subjectOptions.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, subject: option.value });
                                                                    setSubjectOpen(false);
                                                                }}
                                                                className={`w-full px-4 py-3 text-left text-[13px] transition-all duration-150 flex items-center justify-between
                            ${formData.subject === option.value
                                                                        ? 'bg-[#eaf2e6] text-[#2d6a1f] font-bold'
                                                                        : 'text-gray-600 hover:bg-[#f5faf2] hover:text-[#2d6a1f]'
                                                                    }`}
                                                            >
                                                                {option.label}
                                                                {formData.subject === option.value && (
                                                                    <CheckCircle2 className="h-4 w-4 text-[#3b7a2a]" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-black text-gray-600 uppercase tracking-wider">
                                            Message <span className="text-red-400 normal-case tracking-normal">*</span>
                                        </label>
                                        <textarea
                                            rows={6}
                                            placeholder="Type your message here…"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#fafafa] text-[13px] text-gray-700 placeholder:text-gray-300 focus:border-[#6ab04c] focus:bg-white focus:ring-2 focus:ring-[#6ab04c]/15 transition-all duration-200 resize-none"
                                            required
                                        />
                                        <p className="text-right text-[10px] text-gray-300">{formData.message.length} characters</p>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className={`group relative w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-[14px] tracking-wide transition-all duration-300 overflow-hidden
                                                    ${submitted
                                                ? "bg-[#27ae60] text-white scale-[0.99]"
                                                : "text-white hover:-translate-y-0.5 hover:shadow-2xl"
                                            }`}
                                        style={!submitted ? {
                                            background: 'linear-gradient(135deg, #2d6a1f 0%, #4a8c32 50%, #24511a 100%)',
                                            boxShadow: '0 6px 24px rgba(45,106,31,0.35)'
                                        } : undefined}
                                    >
                                        {!submitted && (
                                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
                                        )}
                                        {submitted ? (
                                            <span className="flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Message Sent Successfully!
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send className="h-4 w-4" />
                                                Send Message
                                            </span>
                                        )}
                                    </button>

                                    {/* Privacy */}
                                    <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5 mt-1">
                                        <Lock className="h-3 w-3" />
                                        We respect your privacy. Your information is safe and never shared.
                                    </p>
                                </form>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                            MAP SECTION
                        ═══════════════════════════════════════════════════════════════ */}
                <section className="py-8 pb-4 bg-white">
                    <div className="w-full mx-auto max-w-[1300px] px-6 md:px-12">

                        <div className="text-center mb-8">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#4a7c3f] bg-[#eaf2e6] rounded-full px-4 py-2 border border-[#b5d99a]/40 shadow-sm mb-3">
                                📍 Location
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black text-[#1a3d10]" style={{ fontFamily: "'Georgia', serif" }}>
                                Find Us <span className="text-[#3b7a2a] italic">Here</span>
                            </h2>
                        </div>

                        <div className="rounded-3xl overflow-hidden border border-gray-100 grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[320px]"
                            style={{ boxShadow: '0 4px 24px rgba(26,61,16,0.08)' }}>

                            {/* Info panel */}
                            <div className="bg-white p-5 sm:p-8 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-gray-100">
                                <div className="w-12 h-12 rounded-2xl bg-[#fdecea] flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-[#c0392b]" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-[#1a3d10]">Untapped Nature</p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 mb-3">Legal Entity: KAMLA BHANWARLAL PORWAL</p>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Our Address</p>
                                    <p className="text-sm text-gray-500">Karnavati Kamdhenu Gaushala, Mota Vas, sanoda, Gandhinagar, Gujarat, India</p>
                                </div>
 
                                 {/* Quick contact */}
                                 <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-100">
                                     <div className="flex items-center gap-2.5">
                                         <div className="w-7 h-7 rounded-lg bg-[#eaf2e6] flex items-center justify-center">
                                             <Phone className="h-3.5 w-3.5 text-[#3b7a2a]" strokeWidth={1.8} />
                                         </div>
                                         <span className="text-[12px] font-semibold text-gray-600">+91 70967 12340</span>
                                     </div>
                                     <div className="flex items-center gap-2.5">
                                         <div className="w-7 h-7 rounded-lg bg-[#e8f4fd] flex items-center justify-center">
                                             <Mail className="h-3.5 w-3.5 text-[#2980b9]" strokeWidth={1.8} />
                                         </div>
                                         <span className="text-[11px] font-semibold text-gray-600">info@untappednature.com</span>
                                     </div>
                                 </div>
 
                                 <button
                                     onClick={() => window.open("https://maps.google.com/?q=Karnavati+Kamdhenu+Gaushala,+Mota+Vas,+sanoda,+Gandhinagar,+Gujarat,+India", '_blank')}
                                     className="group flex items-center gap-2 text-white text-[12px] font-black px-5 py-3 rounded-xl w-fit transition-all duration-300 hover:-translate-y-0.5 mt-auto"
                                     style={{ background: 'linear-gradient(135deg, #24511a 0%, #3b8a28 100%)', boxShadow: '0 4px 16px rgba(36,81,26,0.3)' }}
                                 >
                                     Get Directions
                                     <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                 </button>
                             </div>
 
                             {/* Map */}
                             <div className="relative min-h-[260px] sm:min-h-[300px]">
                                     <iframe
                                         src="https://maps.google.com/maps?q=Karnavati+Kamdhenu+Gaushala,+Sanoda,+Gandhinagar,+Gujarat,+India&output=embed"
                                     width="100%"
                                     height="100%"
                                     style={{ border: 0, minHeight: '260px', filter: 'saturate(0.8) hue-rotate(10deg)' }}
                                     allowFullScreen
                                     loading="lazy"
                                     referrerPolicy="no-referrer-when-downgrade"
                                     className="absolute inset-0 w-full h-full"
                                 />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════════
                        FAQ SECTION — replace the entire <section className="py-8 bg-white"> block
                    ═══════════════════════════════════════════════════════════════ */}
                <section className="py-12 bg-white">
                    <div className="w-full mx-auto max-w-[1300px] px-6 md:px-12">

                        <div className="text-center mb-10">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#4a7c3f] bg-[#eaf2e6] rounded-full px-4 py-2 border border-[#b5d99a]/40 mb-4">
                                🌿 FAQ
                            </span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1a3d10] leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                                Frequently Asked{" "}
                                <span className="text-[#3b7a2a] italic relative">
                                    Questions
                                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 230 8" fill="none">
                                        <path d="M2 6 Q57 1 115 5 Q173 9 228 5" stroke="#6ab04c" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
                                    </svg>
                                </span>
                            </h2>
                            <p className="text-gray-400 text-sm mt-4 max-w-[400px] mx-auto">
                                Can&apos;t find an answer? Feel free to reach out via the contact form above.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* LEFT COLUMN */}
                            <div className="flex flex-col gap-3">
                                {faqs.slice(0, 4).map((faq, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border bg-white overflow-hidden transition-all duration-300 hover:border-[#b5d99a] hover:shadow-md"
                                        style={{ borderColor: openFaqLeft === index ? '#6ab04c' : '#e5e7eb' }}
                                    >
                                        <button
                                            onClick={() => setOpenFaqLeft(openFaqLeft === index ? null : index)}
                                            className="w-full flex items-center justify-between px-4 py-4 text-left gap-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{ background: faq.iconBg }}
                                                >
                                                    <faq.Icon className="h-4 w-4" style={{ color: faq.iconColor }} strokeWidth={1.8} />
                                                </div>
                                                <span className="text-[12.5px] sm:text-[13px] font-bold text-gray-700 leading-snug">
                                                    {faq.q}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span
                                                    className="hidden sm:inline text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                                                    style={{ background: faq.tagBg, color: faq.tagColor }}
                                                >
                                                    {faq.tag}
                                                </span>
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[16px] font-black transition-all duration-300 ${openFaqLeft === index
                                                    ? "bg-[#3b7a2a] text-white rotate-180 scale-95"
                                                    : "border border-gray-200 text-gray-400 hover:border-[#b5d99a] hover:text-[#3b7a2a]"
                                                    }`}>
                                                    {openFaqLeft === index ? "−" : "+"}
                                                </div>
                                            </div>
                                        </button>
                                        <div className={`faq-answer ${openFaqLeft === index ? 'open' : ''}`}>
                                            <p className="px-4 pb-4 pl-[52px] text-[13px] text-gray-500 leading-relaxed">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="flex flex-col gap-3">
                                {faqs.slice(4, 8).map((faq, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border bg-white overflow-hidden transition-all duration-300 hover:border-[#b5d99a] hover:shadow-md"
                                        style={{ borderColor: openFaqRight === index ? '#6ab04c' : '#e5e7eb' }}
                                    >
                                        <button
                                            onClick={() => setOpenFaqRight(openFaqRight === index ? null : index)}
                                            className="w-full flex items-center justify-between px-4 py-4 text-left gap-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{ background: faq.iconBg }}
                                                >
                                                    <faq.Icon className="h-4 w-4" style={{ color: faq.iconColor }} strokeWidth={1.8} />
                                                </div>
                                                <span className="text-[12.5px] sm:text-[13px] font-bold text-gray-700 leading-snug">
                                                    {faq.q}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span
                                                    className="hidden sm:inline text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                                                    style={{ background: faq.tagBg, color: faq.tagColor }}
                                                >
                                                    {faq.tag}
                                                </span>
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[16px] font-black transition-all duration-300 ${openFaqRight === index
                                                    ? "bg-[#3b7a2a] text-white rotate-180 scale-95"
                                                    : "border border-gray-200 text-gray-400 hover:border-[#b5d99a] hover:text-[#3b7a2a]"
                                                    }`}>
                                                    {openFaqRight === index ? "−" : "+"}
                                                </div>
                                            </div>
                                        </button>
                                        <div className={`faq-answer ${openFaqRight === index ? 'open' : ''}`}>
                                            <p className="px-4 pb-4 pl-[52px] text-[13px] text-gray-500 leading-relaxed">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center gap-3 bg-[#f5faf2] border border-[#c8dfc0]/60 rounded-2xl px-6 py-4">
                                <span className="text-[13px] text-gray-500">Still have a question?</span>
                                <button
                                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="text-[13px] font-black text-[#2d6a1f] hover:underline flex items-center gap-1"
                                >
                                    Contact us <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </UserLayout>
    );
}
