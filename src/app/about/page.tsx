"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import UserLayout from '../../components/layout/UserLayout';
import {
    Leaf,
    ShieldCheck,
    Users,
    Target,
    Recycle,
    FlaskConical,
    Sprout,
    HeartHandshake,
    Truck,
    Headphones,
    BadgeCheck,
    Wallet,
    Lock,
    Award,
    TreePine,
    Droplets,
    Building2,
    MapPin,
    Mail,
    Phone,
    Hash,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    const router = useRouter();

    return (
        <UserLayout>
            <div className="min-h-[85vh] bg-white text-gray-800 font-sans">

                {/* ── HERO BANNER ─────────────────────────── */}
                <section className="relative w-full overflow-hidden flex items-center min-h-[85vh]">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#e8f5e2] via-[#f4faf0] to-[#dff0d8] min-h-[85vh]" />

                    {/* Floating organic blobs */}
                    <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full bg-[#c8e6b0]/30 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-[-60px] right-[-60px] w-[380px] h-[380px] rounded-full bg-[#a8d888]/25 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                    <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] rounded-full bg-[#b5d99a]/20 blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

                    {/* Subtle dot grid texture */}
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: 'radial-gradient(circle, #2d6a1f 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                    />
                    <div className="relative z-10 w-full max-w-[1500px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4 md:py-8 min-h-[85vh]">
                        {/* Left Side Content — with staggered fade-in */}
                        <div className="flex flex-col justify-center text-left space-y-6">
                            <span
                                className="text-xs uppercase font-bold tracking-[0.3em] text-[#4a7c3f] w-fit px-3 py-1.5 bg-[#e8f5e2] rounded-full border border-[#b5d99a]/50"
                                style={{ animation: 'heroFadeUp 0.7s ease forwards', opacity: 1 }}
                            >
                                About Us
                            </span>

                            <h1
                                className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-[#1a3d10] leading-[1.05] tracking-tight"
                                style={{ animation: 'heroFadeUp 0.7s ease forwards', opacity: 1 }}
                            >
                                About<br />
                                <span className="text-[#3b7a2a] relative inline-block">
                                    Untapped
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 8 Q75 2 150 8 Q225 14 298 8" stroke="#6ab04c" strokeWidth="3" strokeLinecap="round" fill="none" />
                                    </svg>
                                </span>
                                {" "}Nature
                            </h1>

                            <p
                                className="text-sm sm:text-lg font-semibold text-[#4a7c3f] tracking-widest"
                                style={{ animation: 'heroFadeUp 0.7s ease forwards', opacity: 1 }}
                            >
                                Natural &nbsp;•&nbsp; Organic &nbsp;•&nbsp; Trusted
                            </p>

                            <p
                                className="text-gray-500 text-[15px] leading-relaxed max-w-[420px]"
                                style={{ animation: 'heroFadeUp 0.7s ease forwards', opacity: 1 }}
                            >
                                Untapped Nature is dedicated to providing high-quality natural
                                and organic products made with purity, sustainability, and
                                traditional values.
                            </p>

                            {/* Trust badges */}
                            <div
                                className="flex flex-wrap gap-3 pt-1"
                                style={{ animation: 'heroFadeUp 0.7s ease forwards', opacity: 1 }}
                            >
                                {['100% Natural', 'No Chemicals', 'Eco Friendly'].map((tag) => (
                                    <span key={tag} className="text-xs font-semibold text-[#3b7a2a] bg-white border border-[#b5d99a] rounded-full px-3 py-1 shadow-sm">
                                        ✓ {tag}
                                    </span>
                                ))}
                            </div>

                            <div
                                className="pt-2"
                                style={{ animation: 'heroFadeUp 0.7s ease forwards', opacity: 1 }}
                            >
                                <button
                                    onClick={() => router.push("/shop")}
                                    className="group relative bg-[#24511a] hover:bg-[#1b3d13] text-white text-sm font-bold px-8 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg shadow-[#24511a]/30 hover:shadow-xl hover:shadow-[#24511a]/40 hover:-translate-y-0.5 w-fit overflow-hidden"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    Shop Our Products
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">❯</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Side — Image without any border box */}
                        <div className="relative flex items-center justify-center overflow-visible px-6 md:px-0"
                            style={{ animation: 'heroImageReveal 1s ease forwards', opacity: 1 }}
                        >

                            {/* Glowing background circle */}
                            <div className="absolute w-[520px] h-[520px] rounded-full bg-gradient-radial from-[#c8e6a8]/50 to-transparent blur-2xl" />

                            {/* Soft decorative rings */}
                            <div className="absolute w-[480px] h-[480px] rounded-full border border-[#a8d480]/20" />
                            <div className="absolute w-[420px] h-[420px] rounded-full border border-[#a8d480]/15" />

                            {/* The image — NO border, NO box, floats freely */}
                            <div
                                className="relative z-10 w-full max-w-[580px]"
                                style={{ animation: 'heroFloat 4s ease-in-out infinite' }}
                            >
                                <Image
                                    src="/hero-products.jpeg"
                                    alt="Untapped Nature Products"
                                    width={580}
                                    height={420}
                                    className="w-full h-auto object-cover rounded-[40%_60%_55%_45%/45%_55%_60%_40%] shadow-2xl shadow-[#1a3d10]/20"
                                    priority
                                />
                                {/* Subtle green overlay tint at bottom */}
                                <div className="absolute inset-0 rounded-[40%_60%_55%_45%/45%_55%_60%_40%] bg-gradient-to-t from-[#1a3d10]/10 via-transparent to-transparent" />
                            </div>

                            {/* Floating badge — top left */}
                            <div
                                className="absolute top-4 left-0 z-20 bg-white rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 border border-gray-100"
                                style={{ animation: 'badgeFloat 5s ease-in-out infinite', animationDelay: '0.5s' }}
                            >
                                <div className="w-9 h-9 rounded-full bg-[#e8f5e2] flex items-center justify-center text-lg">🌿</div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800 leading-none">100% Organic</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Certified Pure</p>
                                </div>
                            </div>

                            {/* Floating badge — bottom right */}
                            <div
                                className="absolute bottom-4 right-0 z-20 bg-white rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 border border-gray-100"
                                style={{ animation: 'badgeFloat 5s ease-in-out infinite', animationDelay: '1.5s' }}
                            >
                                <div className="w-9 h-9 rounded-full bg-[#fff3e0] flex items-center justify-center text-lg">🌱</div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800 leading-none">Eco Friendly</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Sustainably Sourced</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Keyframe styles */}
                    <style jsx>{`
                        @keyframes heroFadeUp {
                            from { opacity: 0; transform: translateY(28px); }
                            to   { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes heroImageReveal {
                            from { opacity: 0; transform: scale(0.93) translateY(20px); }
                            to   { opacity: 1; transform: scale(1) translateY(0); }
                        }
                        @keyframes heroFloat {
                            0%, 100% { transform: translateY(0px); }
                            50%       { transform: translateY(-14px); }
                        }
                        @keyframes badgeFloat {
                            0%, 100% { transform: translateY(0px); }
                            50%       { transform: translateY(-8px); }
                        }
                    `}</style>
                </section>

                {/* ── WHO WE ARE (MATCHED TO REFERENCE IMAGE) ──────────────────── */}
                <section className="py-10 bg-white flex items-center justify-center">
                    <div className="w-full mx-auto max-w-[1250px] px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">

                        {/* Left Side: Image Container */}
                        <div className="md:col-span-5 relative w-full aspect-[3/2] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
                            <Image
                                src="/aboutus1.jpeg"
                                alt="Who We Are - Natural Alchemy"
                                fill
                                className="object-cover bg-[#edf4ea]"
                            />
                        </div>

                        {/* Right Side: Copy & Pillars */}
                        <div className="md:col-span-7 flex flex-col justify-top space-y-4">
                            <div>
                                <span className="inline-block bg-[#eaf2e6] text-[#3b602c] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                                    Who We Are
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-black tracking-tight mb-4">
                                    Who We Are
                                </h2>
                                <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed font-medium">
                                    At Untapped Nature, we believe that nature provides everything needed for a healthy, sustainable, and meaningful lifestyle. Our mission is to bring the purity of traditional Indian products to every home through carefully crafted, natural, and eco-friendly offerings.
                                </p>
                                <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed font-medium mt-3">
                                    From A2 Desi Cow Ghee, Cow Dung (Gomaya) products, and Panchgavya-based essentials to organic and herbal products, every item is made with authenticity, quality, and respect for our rich cultural heritage. We work closely with trusted Gaushalas and traditional practices to ensure that every product is pure, safe, and naturally beneficial.
                                </p>
                                <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed font-medium mt-3">
                                    More than just an online store, Untapped Nature is committed to promoting a healthier lifestyle, supporting sustainable living, and preserving the timeless wisdom of Indian traditions for future generations.
                                </p>
                                <p className="text-[#3b602c] text-sm md:text-[15px] leading-relaxed font-semibold mt-4 italic border-l-4 border-[#3b602c] pl-3">
                                    Pure from Nature &nbsp;•&nbsp; Rooted in Tradition &nbsp;•&nbsp; Crafted for a Better Tomorrow
                                </p>
                            </div>

                            {/* 3 Value Pillars (With Border Splitters) */}
                            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-gray-100">

                                {/* Pillar 1 */}
                                <div className="flex flex-row items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#f4faf1] flex items-center justify-center flex-shrink-0 border border-emerald-50 text-lg leading-none">
                                        🌿
                                    </div>
                                    <div className="flex flex-col space-y-0.5">
                                        <h4 className="font-bold text-gray-900 text-sm">100% Natural Products</h4>
                                        <p className="text-xs text-gray-500 font-medium leading-tight">Premium A2 Ghee, Cow Dung &amp; Organic Essentials</p>
                                    </div>
                                </div>

                                {/* Pillar 2 */}
                                <div className="flex flex-row items-start gap-3 sm:border-l sm:border-gray-100 sm:pl-4">
                                    <div className="h-10 w-10 rounded-full bg-[#f4faf1] flex items-center justify-center flex-shrink-0 border border-emerald-50 text-lg leading-none">
                                        🐄
                                    </div>
                                    <div className="flex flex-col space-y-0.5">
                                        <h4 className="font-bold text-gray-900 text-sm">Gaushala Based</h4>
                                        <p className="text-xs text-gray-500 font-medium leading-tight">Made using ethically sourced indigenous cow products</p>
                                    </div>
                                </div>

                                {/* Pillar 3 */}
                                <div className="flex flex-row items-start gap-3 sm:border-l sm:border-gray-100 sm:pl-4">
                                    <div className="h-10 w-10 rounded-full bg-[#f4faf1] flex items-center justify-center flex-shrink-0 border border-emerald-50 text-lg leading-none">
                                        ♻️
                                    </div>
                                    <div className="flex flex-col space-y-0.5">
                                        <h4 className="font-bold text-gray-900 text-sm">Sustainable Living</h4>
                                        <p className="text-xs text-gray-500 font-medium leading-tight">Eco-friendly products inspired by Indian traditions</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                {/* ── OUR MISSION ────────────────── */}
                <section className="py-6 bg-white flex items-center justify-center overflow-hidden">
                    <div className="w-full mx-auto max-w-[1250px] px-6 md:px-12">
                        <div className="relative w-full bg-gradient-to-br from-[#e8f5e2] via-[#f0f9ea] to-[#dff0d8] rounded-2xl p-5 sm:p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center overflow-hidden">

                            {/* Background decorative elements */}
                            <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/5 blur-2xl pointer-events-none" />
                            <div className="absolute bottom-[-30px] left-[-30px] w-[160px] h-[160px] rounded-full bg-[#6ab04c]/10 blur-xl pointer-events-none" />
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                            />

                            {/* Left Text Block */}
                            <div className="md:col-span-8 space-y-3 relative z-10">

                                <span className="inline-block bg-[#d4edca] text-[#3b7a2a] text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full border border-[#b5d99a]/50">
                                    Our Mission
                                </span>

                                <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a3d10] tracking-tight leading-tight">
                                    Connecting You With{" "}
                                    <span className="text-[#6ab04c] relative inline-block">
                                        The Power of Nature
                                        <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 320 8" fill="none">
                                            <path d="M2 6 Q80 2 160 6 Q240 10 318 6" stroke="#6ab04c" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
                                        </svg>
                                    </span>
                                </h2>

                                <p className="text-gray-600 text-[13px] leading-relaxed max-w-xl">
                                    Our mission is to connect customers with nature by offering pure, trusted, and environmentally responsible products — promoting healthy living and protecting our planet for future generations.
                                </p>

                                {/* Mission pillars — compact row */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {[
                                        { emoji: '🌿', label: 'Healthy Living' },
                                        { emoji: '🤝', label: 'Community Support' },
                                        { emoji: '🌍', label: 'Planet First' },
                                    ].map(({ emoji, label }) => (
                                        <div key={label} className="flex items-center gap-2 bg-white/80 hover:bg-white border border-[#b5d99a] rounded-xl px-3 py-2 transition-all duration-200 group cursor-default">
                                            <span className="text-sm group-hover:scale-110 transition-transform duration-200 inline-block">{emoji}</span>
                                            <p className="text-[#1a3d10] font-semibold text-xs">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Visual Block */}
                            <div className="hidden md:flex md:col-span-4 justify-center items-center relative z-10 min-h-[160px]">
                                <div className="absolute w-[180px] h-[180px] rounded-full border border-[#4a7c3f]/30 animate-ping" style={{ animationDuration: '3s' }} />
                                <div className="absolute w-[155px] h-[155px] rounded-full border border-[#6ab04c]/25" />
                                <div className="absolute w-[130px] h-[130px] rounded-full bg-[#6ab04c]/10 blur-lg" />

                                <div
                                    className="relative w-[150px] h-[150px]"
                                    style={{ animation: 'missionFloat 4s ease-in-out infinite' }}
                                >
                                    <Image
                                        src="/aboutus2.png"
                                        alt="Our Mission"
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    <style jsx>{`
        @keyframes missionFloat {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-10px); }
        }
    `}</style>
                </section>

                {/* ── WHAT WE OFFER ───────────────────────────────────────────── */}
                <section className="py-8 bg-white">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="text-center mb-12">
                            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4a7c3f] border border-[#4a7c3f]/30 rounded-full px-3 py-1 mb-4">
                                What We Offer
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                                What We Offer
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                            {[
                                {
                                    icon: Leaf,
                                    title: "Organic Products",
                                    desc: "Pure and natural organic essentials",
                                },
                                {
                                    icon: Sprout,
                                    title: "Natural Farming Products",
                                    desc: "High-quality products from natural farming",
                                },
                                {
                                    icon: FlaskConical,
                                    title: "Herbal & Wellness",
                                    desc: "Herbal and wellness products for a healthy life",
                                },
                                {
                                    icon: HeartHandshake,
                                    title: "Traditional & Handmade",
                                    desc: "Traditionally made with care and purity",
                                },
                                {
                                    icon: Recycle,
                                    title: "Eco-Friendly Goods",
                                    desc: "Sustainable and eco-friendly choices",
                                },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-gray-200 hover:border-[#4a7c3f]/40 hover:shadow-lg transition-all bg-white">
                                    <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-[#f0f7ec] flex items-center justify-center border border-[#d4eaca]">
                                        <Icon className="h-8 w-8 sm:h-12 sm:w-12 text-[#4a7c3f]" strokeWidth={1.5} />
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm leading-snug">{title}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── WHY CHOOSE US ───────────────────────────────────────────── */}
                <section className="py-8 bg-white">
                    <div className="w-full mx-auto max-w-[1250px] px-6 md:px-12">
                        <div className="text-center mb-7">
                            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#4a7c3f] bg-[#eaf2e6] rounded-full px-3 py-1 mb-3">
                                Why Choose Us
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a3d10]">
                                Why Choose Us
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { icon: Award, title: "High Quality Products", desc: "We never compromise on quality.", emoji: "🏆" },
                                { icon: ShieldCheck, title: "Trusted Sourcing", desc: "Sourced from trusted farmers and partners.", emoji: "🛡️" },
                                { icon: Wallet, title: "Affordable Prices", desc: "Best quality products at fair prices.", emoji: "💰" },
                                { icon: Lock, title: "Secure Payments", desc: "100% secure and safe transactions.", emoji: "🔒" },
                                { icon: Truck, title: "Fast Delivery", desc: "Quick and reliable delivery at your door.", emoji: "🚚" },
                                { icon: Headphones, title: "Dedicated Support", desc: "We are here to help you anytime.", emoji: "🎧" },
                            ].map(({ icon: Icon, title, desc, emoji }) => (
                                <div key={title}
                                    className="group relative flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#b5d99a] hover:bg-[#f7fbf4] hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#eaf2e6] group-hover:bg-[#d4edca] flex items-center justify-center transition-colors duration-300">
                                        <Icon className="h-5 w-5 text-[#3b7a2a]" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm mb-0.5">{title}</p>
                                        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                                    </div>
                                    <span className="hidden sm:block absolute top-3 right-4 text-lg opacity-20 group-hover:opacity-40 transition-opacity">{emoji}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── OUR VALUES ──────────────────────────────────────────────── */}
                <section className="py-8 bg-[#f7fbf4]">
                    <div className="w-full mx-auto max-w-[1250px] px-6 md:px-12">
                        <div className="text-center mb-7">

                            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#4a7c3f] bg-[#eaf2e6] rounded-full px-3 py-1 mb-3">
                                Our Values
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a3d10]">
                                Our Values
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {[
                                { icon: Droplets, title: "Purity", desc: "We ensure purity in every product.", color: "bg-[#e0f4ff]", iconColor: "text-[#2980b9]" },
                                { icon: BadgeCheck, title: "Trust", desc: "Honesty and transparency always.", color: "bg-[#eaf2e6]", iconColor: "text-[#3b7a2a]" },
                                { icon: Recycle, title: "Sustainability", desc: "We care for nature and our environment.", color: "bg-[#e8f8e8]", iconColor: "text-[#27ae60]" },
                                { icon: HeartHandshake, title: "Customer Satisfaction", desc: "Your happiness is our success.", color: "bg-[#fdecea]", iconColor: "text-[#c0392b]" },
                                { icon: TreePine, title: "Nature First", desc: "Nature is at the heart of our brand.", color: "bg-[#fef9e7]", iconColor: "text-[#d4a017]" },
                            ].map(({ icon: Icon, title, desc, color, iconColor }) => (
                                <div key={title}
                                    className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 hover:border-[#b5d99a] hover:shadow-md transition-all duration-300"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`h-7 w-7 ${iconColor}`} strokeWidth={1.5} />
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm">{title}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── BUSINESS INFORMATION ────────────────────────────────────── */}
                <section className="py-8 bg-white">
                    <div className="w-full mx-auto max-w-[1250px] px-6 md:px-12">
                        <div className="text-center mb-7">
                            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#4a7c3f] bg-[#eaf2e6] rounded-full px-3 py-1 mb-3">
                                Business Information
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a3d10]">
                                Business Information
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">We are a registered business committed to transparency and trust.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 [&>*:last-child]:sm:col-span-2 [&>*:last-child]:lg:col-span-1">
                            {[
                                { icon: Building2, label: "Legal Business Name", value: "Untapped Nature", color: "bg-[#eaf2e6]", iconColor: "text-[#3b7a2a]" },
                                { icon: MapPin, label: "Business Address", value: "Karnavati Kamdhenu Gaushala, Mota Vas, Sanoda, Gandhinagar, Gujarat, India", color: "bg-[#fdecea]", iconColor: "text-[#c0392b]" },
                                { icon: Mail, label: "Email Address", value: "info@untappednature.com", color: "bg-[#e8f4fd]", iconColor: "text-[#2980b9]" },
                                { icon: Phone, label: "Phone Number", value: "+91 70967 12340", color: "bg-[#fef9e7]", iconColor: "text-[#d4a017]" },
                                // { icon: Hash, label: "GST Number", value: "24ABCDE1234F1Z5", color: "bg-[#f4ecf7]", iconColor: "text-[#8e44ad]" },
                            ].map(({ icon: Icon, label, value, color, iconColor }) => (
                                <div key={label}
                                    className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#b5d99a] hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                                        <Icon className={`h-5 w-5 ${iconColor}`} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</span>
                                        <span className="text-sm text-gray-800 font-bold break-words">{value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA BANNER ──────────────────────────────────────────────── */}
                <section className="py-4 pb-0 bg-white">
                    <div className="w-full mx-auto max-w-[1250px] px-6 md:px-12">

                        <div className="relative w-full bg-[#f5f8f3] rounded-3xl overflow-hidden border border-[#eef3eb] min-h-[200px] flex items-center">

                            {/* Left Content */}
                            <div className="relative z-10 flex flex-col gap-4 px-6 py-8 sm:px-10 sm:py-10 md:max-w-[55%]">
                                <p className="text-gray-600 text-sm">
                                    Have questions or need more information?
                                </p>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
                                    We'd love to hear from you!
                                </h2>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 bg-[#2d6a1f] hover:bg-[#245518] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors w-fit text-sm"
                                >
                                    Contact Us <span>❯</span>
                                </Link>
                            </div>

                            {/* Right Image */}
                            <div className="absolute right-0 top-0 bottom-0 w-[45%] hidden md:block">
                                <Image
                                    src="/aboutus1.jpeg"
                                    alt="Contact Us"
                                    fill
                                    className="object-cover object-left"
                                />
                                {/* Gradient fade left */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#f5f8f3] via-[#f5f8f3]/40 to-transparent" />
                            </div>

                        </div>
                    </div>
                </section>
            </div>
        </UserLayout>
    );
}
