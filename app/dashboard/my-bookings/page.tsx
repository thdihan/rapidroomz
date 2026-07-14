"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarRange, MapPin, Eye, Building2, User, CreditCard } from "lucide-react";
import Link from "next/link";

export default function MyBookingsPage() {
    const { data: session } = useSession();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!session?.user) return;
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
                // Since this is a prototype and we changed the backend to take userId in params
                const res = await fetch(`${API_URL}/booking/my-bookings/${(session.user as any).id}`);
                const data = await res.json();
                if (data.success) {
                    setBookings(data.data);
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [session]);

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-gray-500 text-sm">Loading your booking history...</p>
                </div>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CalendarRange className="text-primary size-6" /> My Bookings
                </h1>
                <p className="text-gray-500 text-sm mt-1">Manage and view your past and upcoming reservations.</p>
            </div>

            {bookings.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="size-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                            <CalendarRange className="size-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h2>
                        <p className="text-gray-500 mb-6 max-w-md">You haven't made any reservations yet. Start exploring properties to plan your next stay!</p>
                        <Link href="/properties?type=hotel">
                            <Button className="bg-primary hover:bg-primary/90">Browse Properties</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <Card key={booking._id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-gray-200">
                            <div className="flex flex-col md:flex-row">
                                {/* Left Section: Status & Property */}
                                <div className="p-6 md:w-1/3 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {booking.status}
                                            </span>
                                            <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border shadow-sm">
                                                ID: {booking.bookingId}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{booking.propertyName}</h3>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-widest bg-gray-200 w-fit px-2 py-0.5 rounded">
                                            <Building2 className="size-3" /> {booking.propertyType}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200/60">
                                        <p className="text-xs text-gray-500 font-medium mb-1">Booked on</p>
                                        <p className="text-sm font-semibold text-gray-900">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                {/* Right Section: Details & Action */}
                                <div className="p-6 md:w-2/3 flex flex-col justify-between bg-white">
                                    <div className="space-y-4">
                                        {booking.propertyType === 'villa' || booking.propertyType === 'apartment' ? (
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="font-bold text-sm text-gray-800">Entire Property Reserved</div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {booking.selectedRooms.map((roomInfo: any, idx: number) => (
                                                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                                                        <div>
                                                            <div className="font-bold text-sm text-gray-800">{roomInfo.noOfRooms}x {roomInfo.room?.name || roomInfo.room?.roomType || 'Room'}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">{roomInfo.checkIn} to {roomInfo.checkOut} ({roomInfo.nights} nights)</div>
                                                        </div>
                                                        <div className="font-bold text-sm text-gray-900">৳ {roomInfo.totalPrice.toLocaleString()}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 flex flex-col justify-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User className="size-4 text-gray-400" />
                                                    <span className="font-semibold text-gray-800 text-xs uppercase tracking-wider">Guest Info</span>
                                                </div>
                                                <span className="font-medium text-gray-800">{booking.contactInfo.name}</span>
                                                <span className="text-xs">{booking.contactInfo.phone}</span>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="size-4 text-gray-400" />
                                                        <span className="font-semibold text-gray-800 text-xs uppercase tracking-wider">Payment</span>
                                                    </div>
                                                    <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border">
                                                        {booking.paymentMethod}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 font-medium">Status</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                        booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                                        booking.paymentStatus === 'Refunded' ? 'bg-gray-200 text-gray-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {booking.paymentStatus || 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-end justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Amount</p>
                                            <p className="text-2xl font-extrabold text-gray-900">৳ {booking.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/properties/${booking.propertyId}?type=${booking.propertyType}`}>
                                                <Button variant="outline" size="sm" className="font-semibold text-gray-700">
                                                    View Property
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
