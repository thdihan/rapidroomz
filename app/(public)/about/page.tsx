import React from "react";
import { ShieldCheck, Target, Heart, Building2, Sparkles } from "lucide-react";

export const metadata = {
    title: "About Us - RapidRoomz",
    description: "Learn more about RapidRoomz and our mission to simplify stay booking.",
};

export default async function AboutPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    let aboutUsText = "RapidRoomz is a modern property booking platform designed to connect hotel, resort, villa, and apartment owners with guests globally. We focus on providing seamless stay bookings, high-fidelity user experiences, and premium customer service.";

    try {
        const res = await fetch(`${apiUrl}/setting/about_us`, { next: { revalidate: 0 } });
        if (res.ok) {
            const data = await res.json();
            if (data?.data?.value) {
                aboutUsText = data.data.value;
            }
        }
    } catch (error) {
        console.error("Error fetching About Us text:", error);
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-primary overflow-hidden text-center py-20 md:py-28">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&h=800&fit=crop')] bg-cover bg-center opacity-15" />
                <div className="relative container max-w-4xl mx-auto px-4">
                    <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest mb-4">
                            <Sparkles className="size-3.5 text-[#f5a124]" />
                            Our Story
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground tracking-tight mb-6">
                        About <span className="text-[#0168AA]">Rapid</span>Roomz
                    </h1>
                    <p className="text-lg md:text-xl text-primary-foreground/80 font-medium leading-relaxed max-w-2xl mx-auto">
                        We are on a mission to reshape how you discover and book luxury hotel rooms, villas, apartments, and resorts around the globe.
                    </p>
                </div>
            </section>

            {/* Core Story & Content */}
            <section className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                    <div className="md:col-span-7 space-y-6 text-left">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-[#1b5cac] shadow-sm mb-2">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Our Vision & Journey
                        </h2>
                        <div className="text-slate-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                            {aboutUsText}
                        </div>
                    </div>
                    <div className="md:col-span-5 relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-10 blur-lg" />
                        <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl aspect-4/3">
                            <img
                                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"
                                alt="Luxury hotel villa"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="bg-white border-t border-border py-16 md:py-24">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Our Core Pillars
                        </h2>
                        <p className="text-slate-500 font-medium">
                            What drives us to build the finest accommodation platform in the industry.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Pillar 1 */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-left transition-all hover:shadow-md hover:scale-[1.01] group">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 mb-6 group-hover:scale-105 transition-transform">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Unmatched Trust</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                We fully verify every listing on our platform. From rating accuracy to host reliability, we keep bookings secure.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-left transition-all hover:shadow-md hover:scale-[1.01] group">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#1b5cac]/10 text-[#1b5cac] mb-6 group-hover:scale-105 transition-transform">
                                <Target className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Operations</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Our dashboard enables seamless host-to-guest communications, making bookings straightforward and stress-free.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-left transition-all hover:shadow-md hover:scale-[1.01] group">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-rose-50 text-rose-600 mb-6 group-hover:scale-105 transition-transform">
                                <Heart className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Guest-First Design</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                We design modern interfaces that feel responsive and alive, providing smooth payment flows and verified accommodations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
