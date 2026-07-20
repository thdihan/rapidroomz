"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, Send, Sparkles, MessageSquare, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface ContactInfo {
    email: string;
    phone: string;
    address: string;
    workingHours: string;
    mapUrl: string;
}

export default function ContactPage() {
    const [contactInfo, setContactInfo] = useState<ContactInfo>({
        email: "hello@rapidroomz.com",
        phone: "+1 (555) 123-4567",
        address: "123 Booking Street, Travel City, NY 10001",
        workingHours: "Monday - Friday: 9:00 AM - 6:00 PM EST",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.2543635164!2d-74.11976373946229!3d40.69767006338158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1680000000000!5m2!1sen!2s",
    });

    const [loadingInfo, setLoadingInfo] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submittedSuccess, setSubmittedSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
                const res = await fetch(`${apiUrl}/setting/contact_info`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.data?.value) {
                        try {
                            const parsed = JSON.parse(data.data.value);
                            setContactInfo((prev) => ({ ...prev, ...parsed }));
                        } catch (err) {
                            console.error("Failed to parse contact_info JSON", err);
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading contact info:", error);
            } finally {
                setLoadingInfo(false);
            }
        };

        fetchContactInfo();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            setSubmitting(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
            const response = await fetch(`${apiUrl}/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success(data.message || "Message sent successfully!");
                setSubmittedSuccess(true);
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: "",
                });
            } else {
                toast.error(data.message || "Failed to submit query. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting contact form:", error);
            toast.error("Could not connect to server. Please try again later.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-left">
            {/* Hero Banner */}
            <section className="relative bg-primary overflow-hidden text-center py-20 md:py-24">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=800&fit=crop')] bg-cover bg-center opacity-15" />
                <div className="relative container max-w-4xl mx-auto px-4">
                    <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest mb-4">
                            <Sparkles className="size-3.5 text-[#f5a124]" />
                            Get In Touch
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground tracking-tight mb-6">
                        Contact <span className="text-[#0168AA]">Rapid</span>Roomz
                    </h1>
                    <p className="text-lg md:text-xl text-primary-foreground/80 font-medium leading-relaxed max-w-2xl mx-auto">
                        Have a question about your booking, property listing, or general inquiry? Our support team is here to assist you 24/7.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="container max-w-6xl mx-auto px-4 py-16 md:py-20">
                {/* Header at the top across both columns */}
                <div className="space-y-3 mb-10 max-w-2xl">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#1b5cac]">
                        Direct Customer Assistance
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Reach Out to Us
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Choose your preferred way to contact us. Whether you need immediate reservation support or business inquiries, we are ready to help.
                    </p>
                </div>

                {/* Grid layout aligning Headquarters Address card and Send Us a Message card horizontally */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Left Column: 4 Direct Contact Info Cards */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Address Card */}
                        <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-white group py-0">
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-blue-50 text-[#1b5cac] shrink-0 group-hover:scale-105 transition-transform">
                                    <MapPin className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Headquarters Address</h3>
                                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                                        {contactInfo.address}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Phone Card */}
                        <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-white group py-0">
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                                    <Phone className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Phone Support</h3>
                                    <p className="text-xs text-slate-600 font-medium mt-1">
                                        {contactInfo.phone}
                                    </p>
                                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                        Toll Free Customer Care
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Email Card */}
                        <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-white group py-0">
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                                    <Mail className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Official Email</h3>
                                    <p className="text-xs text-slate-600 font-medium mt-1">
                                        {contactInfo.email}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">Typical response time: &lt; 2 hours</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hours Card */}
                        <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-white group py-0">
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
                                    <Clock className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Working Hours</h3>
                                    <p className="text-xs text-slate-600 font-medium mt-1">
                                        {contactInfo.workingHours}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Send Us a Message Card */}
                    <div className="lg:col-span-7">
                        <Card className="shadow-lg border border-slate-200/80 bg-white rounded-2xl overflow-hidden py-0">
                            <CardHeader className="bg-slate-900 text-white p-6 sm:p-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg text-[#0168AA]">
                                        <MessageSquare className="size-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-white">Send Us a Message</CardTitle>
                                        <CardDescription className="text-slate-300 text-xs mt-1">
                                            Fill in the form below and our customer response team will address your inquiry promptly.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 sm:p-8 space-y-6">
                                {submittedSuccess ? (
                                    <div className="p-8 text-center space-y-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                                        <div className="mx-auto w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="size-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-emerald-900">Message Received!</h3>
                                        <p className="text-sm text-emerald-700 max-w-md mx-auto">
                                            Thank you for reaching out. Your query has been logged and sent to our admin team. We will respond to your email shortly.
                                        </p>
                                        <Button
                                            onClick={() => setSubmittedSuccess(false)}
                                            className="bg-[#1b5cac] hover:bg-[#1b5cac]/90 text-white font-bold mt-2"
                                        >
                                            Send Another Message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                                                    Full Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="John Doe"
                                                    required
                                                    className="h-11 rounded-lg border-slate-200 focus-visible:ring-[#1b5cac]"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                                                    Email Address <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="john@example.com"
                                                    required
                                                    className="h-11 rounded-lg border-slate-200 focus-visible:ring-[#1b5cac]"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                                                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+1 (555) 000-0000"
                                                    className="h-11 rounded-lg border-slate-200 focus-visible:ring-[#1b5cac]"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="subject" className="text-xs font-bold text-slate-700">
                                                    Subject <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    placeholder="Booking inquiry, property listing..."
                                                    required
                                                    className="h-11 rounded-lg border-slate-200 focus-visible:ring-[#1b5cac]"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message" className="text-xs font-bold text-slate-700">
                                                Your Message <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                rows={5}
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Provide details about your question or request..."
                                                required
                                                className="rounded-lg border-slate-200 focus-visible:ring-[#1b5cac] p-3 text-sm leading-relaxed"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-[#1b5cac] hover:bg-[#1b5cac]/90 text-white font-bold h-12 rounded-lg text-sm shadow-md shadow-[#1b5cac]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {submitting ? (
                                                <Spinner className="w-5 h-5 text-white" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            {submitting ? "Sending Query..." : "Submit Inquiry"}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>

                {/* Optional Location Map Frame */}
                {contactInfo.mapUrl && (
                    <div className="mt-16 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                        <iframe
                            title="Office Location Map"
                            src={contactInfo.mapUrl}
                            width="100%"
                            height="380"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                )}
            </section>
        </div>
    );
}
