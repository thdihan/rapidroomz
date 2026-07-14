"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, CheckCircle2, User as UserIcon, MapPin, Bed, Phone, Mail, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [bookingData, setBookingData] = useState<any>(null);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmedBookingId, setConfirmedBookingId] = useState("");

    const [contactInfo, setContactInfo] = useState({
        name: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        const stored = sessionStorage.getItem("currentBooking");
        if (stored) {
            setBookingData(JSON.parse(stored));
        } else {
            router.push("/");
        }
    }, [router]);

    useEffect(() => {
        if (session?.user) {
            setContactInfo(prev => ({
                ...prev,
                name: session.user?.name || prev.name,
                email: session.user?.email || prev.email,
                phone: (session.user as any).phone || prev.phone
            }));
        }
    }, [session]);

    if (!bookingData) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
            toast.error("Please fill out all contact information fields.");
            return;
        }
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConfirmBooking = async () => {
        if (!session?.user) {
            toast.error("You must be logged in to complete a booking.");
            return;
        }

        setIsConfirming(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        
        const payload = {
            userId: (session.user as any).id,
            propertyId: bookingData.property.id,
            propertyType: bookingData.property.type,
            propertyName: bookingData.property.name,
            selectedRooms: bookingData.selectedRooms || [],
            contactInfo,
            paymentMethod: "Pay at Hotel",
            totalAmount: bookingData.totalPrice
        };

        try {
            const res = await fetch(`${API_URL}/booking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setConfirmedBookingId(data.data.bookingId);
                sessionStorage.removeItem("currentBooking");
                setStep(3);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                toast.error(data.message || "Failed to confirm booking.");
                setIsConfirming(false);
            }
        } catch (error) {
            console.error("Booking error:", error);
            toast.error("An unexpected error occurred.");
            setIsConfirming(false);
        }
    };

    if (step === 3) {
        return (
            <div className="bg-[#EDF2F7] min-h-screen py-20 flex items-center justify-center px-4">
                <Card className="max-w-md w-full border-0 shadow-lg rounded-2xl overflow-hidden p-0 text-center animate-in zoom-in-95 duration-500">
                    <div className="bg-green-500 p-8 flex justify-center">
                        <div className="bg-white rounded-full p-3 shadow-md">
                            <CheckCircle2 className="size-16 text-green-500" />
                        </div>
                    </div>
                    <CardContent className="p-8 pt-6">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500 mb-6">Your reservation has been successfully processed.</p>
                        
                        <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1">Booking Reference</p>
                            <p className="text-2xl font-bold text-[#1b5cac]">{confirmedBookingId}</p>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <Button 
                                onClick={() => router.push("/dashboard/my-bookings")} 
                                className="w-full bg-[#1b5cac] hover:bg-[#1b5cac]/90 text-white font-bold py-6 text-md rounded-lg shadow-sm"
                            >
                                View My Bookings
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => router.push("/")} 
                                className="w-full font-bold py-6 text-md rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Back to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-[#EDF2F7] min-h-screen py-10 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <Button variant="ghost" onClick={() => step === 2 ? setStep(1) : router.back()} className="mb-6 hover:bg-white text-gray-600">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {step === 2 ? "Back to Contact Info" : "Back to Property"}
                </Button>

                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-8 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-300 rounded-full z-0"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }}></div>
                    
                    <div className="relative z-10 flex flex-col items-center bg-[#EDF2F7] px-2">
                        <div className={`size-10 rounded-full flex items-center justify-center font-bold border-4 text-sm transition-colors ${step >= 1 ? 'bg-primary border-primary/20 text-white' : 'bg-white border-gray-300 text-gray-500'}`}>
                            1
                        </div>
                        <span className="text-xs font-semibold mt-2 text-gray-700">Contact Info</span>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center bg-[#EDF2F7] px-2">
                        <div className={`size-10 rounded-full flex items-center justify-center font-bold border-4 text-sm transition-colors ${step >= 2 ? 'bg-primary border-primary/20 text-white' : 'bg-white border-gray-300 text-gray-500'}`}>
                            2
                        </div>
                        <span className="text-xs font-semibold mt-2 text-gray-700">Summary & Payment</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {step === 1 && (
                            <Card className="border-0 shadow-sm rounded-xl overflow-hidden p-0">
                                <CardHeader className="bg-white border-b p-6">
                                    <CardTitle className="text-2xl flex items-center gap-2 text-gray-900">
                                        <UserIcon className="text-primary size-6" /> Contact Information
                                    </CardTitle>
                                    <p className="text-muted-foreground text-sm mt-1">Please verify your details. We will use this to contact you regarding your reservation.</p>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8 bg-gray-50/50">
                                    <form onSubmit={handleContactSubmit}>
                                        <FieldGroup>
                                            <Field>
                                                <FieldLabel className="text-gray-700 font-bold">Full Name</FieldLabel>
                                                <Input 
                                                    required 
                                                    value={contactInfo.name} 
                                                    onChange={e => setContactInfo({...contactInfo, name: e.target.value})} 
                                                    className="py-6 border-gray-300 focus-visible:ring-primary shadow-sm"
                                                    placeholder="John Doe"
                                                />
                                            </Field>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Field>
                                                    <FieldLabel className="text-gray-700 font-bold">Email Address</FieldLabel>
                                                    <Input 
                                                        type="email" 
                                                        required 
                                                        value={contactInfo.email} 
                                                        onChange={e => setContactInfo({...contactInfo, email: e.target.value})} 
                                                        className="py-6 border-gray-300 focus-visible:ring-primary shadow-sm"
                                                        placeholder="john@example.com"
                                                    />
                                                </Field>
                                                <Field>
                                                    <FieldLabel className="text-gray-700 font-bold">Phone Number</FieldLabel>
                                                    <Input 
                                                        type="tel" 
                                                        required 
                                                        value={contactInfo.phone} 
                                                        onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} 
                                                        className="py-6 border-gray-300 focus-visible:ring-primary shadow-sm"
                                                        placeholder="+1 234 567 890"
                                                    />
                                                </Field>
                                            </div>
                                        </FieldGroup>
                                        <div className="mt-8 flex justify-end">
                                            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-sm text-md">
                                                Proceed to Summary
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="border-0 shadow-sm rounded-xl overflow-hidden p-0">
                                    <CardHeader className="bg-white border-b p-6">
                                        <CardTitle className="text-2xl flex items-center gap-2 text-gray-900">
                                            <CreditCard className="text-primary size-6" /> Payment Method
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 bg-gray-50/50">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <label className="cursor-pointer">
                                                <input type="radio" name="payment" className="peer sr-only" defaultChecked />
                                                <div className="rounded-xl border-2 border-transparent bg-white p-4 shadow-sm peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary transition-all text-center">
                                                    <div className="size-8 mx-auto bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-3 font-bold">$</div>
                                                    <span className="font-bold text-gray-900 block text-sm">Pay at Hotel</span>
                                                    <span className="text-xs text-gray-500 mt-1 block">Pay upon arrival</span>
                                                </div>
                                            </label>
                                            <label className="cursor-pointer opacity-50">
                                                <input type="radio" name="payment" className="peer sr-only" disabled />
                                                <div className="rounded-xl border-2 border-transparent bg-gray-100 p-4 text-center">
                                                    <CreditCard className="size-8 mx-auto text-gray-400 mb-3" />
                                                    <span className="font-bold text-gray-500 block text-sm">Credit Card</span>
                                                    <span className="text-xs text-gray-400 mt-1 block">Coming soon</span>
                                                </div>
                                            </label>
                                            <label className="cursor-pointer opacity-50">
                                                <input type="radio" name="payment" className="peer sr-only" disabled />
                                                <div className="rounded-xl border-2 border-transparent bg-gray-100 p-4 text-center">
                                                    <Phone className="size-8 mx-auto text-gray-400 mb-3" />
                                                    <span className="font-bold text-gray-500 block text-sm">Mobile Banking</span>
                                                    <span className="text-xs text-gray-400 mt-1 block">Coming soon</span>
                                                </div>
                                            </label>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Booking Summary */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-sm rounded-xl overflow-hidden sticky top-8 p-0">
                            <CardHeader className="bg-primary text-white p-6">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <CheckCircle2 className="size-5" /> Booking Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-6 border-b bg-gray-50">
                                    <div className="flex gap-2 items-center mb-2">
                                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded uppercase tracking-wider">{bookingData.property.type}</span>
                                    </div>
                                    <h3 className="font-extrabold text-xl text-gray-900 leading-tight">{bookingData.property.name}</h3>
                                </div>
                                
                                <div className="p-6 border-b space-y-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Selection</h4>
                                    
                                    {bookingData.property.type === 'villa' || bookingData.property.type === 'apartment' ? (
                                        <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                            <Bed className="size-4 text-primary" /> Entire Property Selected
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {bookingData.selectedRooms.map((r: any, idx: number) => (
                                                <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                    <div className="flex justify-between font-bold text-sm text-gray-900 mb-1">
                                                        <span>{r.noOfRooms}x {r.room.name || r.room.roomType}</span>
                                                        <span>৳ {r.totalPrice.toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex justify-between">
                                                        <span>{r.nights} night(s)</span>
                                                        <span>{r.checkIn} to {r.checkOut}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {step === 2 && (
                                    <div className="p-6 border-b space-y-3 bg-gray-50">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Guest Details</h4>
                                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2"><UserIcon className="size-4 text-gray-400" /> {contactInfo.name}</p>
                                        <p className="text-sm font-medium text-gray-600 flex items-center gap-2"><Mail className="size-4 text-gray-400" /> {contactInfo.email}</p>
                                        <p className="text-sm font-medium text-gray-600 flex items-center gap-2"><Phone className="size-4 text-gray-400" /> {contactInfo.phone}</p>
                                        <Button variant="link" size="sm" onClick={() => setStep(1)} className="px-0 text-primary h-auto py-1">Edit details</Button>
                                    </div>
                                )}

                                <div className="p-6 bg-white">
                                    <div className="flex justify-between items-end mb-6">
                                        <span className="text-gray-600 font-semibold text-sm">Total Amount</span>
                                        <span className="text-3xl font-extrabold text-gray-900">৳ {bookingData.totalPrice.toLocaleString()}</span>
                                    </div>
                                    {step === 2 && (
                                        <Button 
                                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-md hover:shadow-lg transition-all rounded-lg"
                                            onClick={handleConfirmBooking}
                                            disabled={isConfirming}
                                        >
                                            {isConfirming ? "Confirming..." : "Complete Reservation"}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
