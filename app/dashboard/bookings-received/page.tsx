"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarRange, Building2, User, CreditCard } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function BookingsReceivedPage() {
    const { data: session } = useSession();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, [session]);

    const fetchBookings = async () => {
        if (!session?.user) return;
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
            const res = await fetch(`${API_URL}/booking/owner-bookings/${(session.user as any).id}`);
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

    const handleUpdateStatus = async (bookingId: string, field: "status" | "paymentStatus", value: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
            const res = await fetch(`${API_URL}/booking/${bookingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`${field === "status" ? "Booking" : "Payment"} status updated!`);
                setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, [field]: value } : b));
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("An error occurred");
        }
    };

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bookings Received</h1>
                    <p className="text-gray-500 text-sm">Loading customer bookings for your properties...</p>
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
                    <CalendarRange className="text-primary size-6" /> Bookings Received
                </h1>
                <p className="text-gray-500 text-sm mt-1">View and manage reservations made by customers for your properties.</p>
            </div>

            {bookings.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="size-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                            <CalendarRange className="size-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h2>
                        <p className="text-gray-500 mb-6 max-w-md">You haven't received any bookings for your properties yet. Optimize your listings to attract more customers!</p>
                        <Link href="/dashboard/properties">
                            <Button className="bg-primary hover:bg-primary/90">Manage Properties</Button>
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
                                        <div className="flex justify-between items-center mb-4 gap-2">
                                            <div className="w-full">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Booking Status</p>
                                                <Select value={booking.status} onValueChange={(val) => handleUpdateStatus(booking.bookingId, "status", val)}>
                                                    <SelectTrigger className="h-8 text-xs font-bold uppercase tracking-wider">
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                        <SelectItem value="On Hold">On Hold</SelectItem>
                                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border shadow-sm block mb-1">
                                                    ID: {booking.bookingId}
                                                </span>
                                            </div>
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
                                                <span className="text-xs">{booking.contactInfo.email}</span>
                                                <span className="text-xs">{booking.contactInfo.phone}</span>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex items-center justify-between mb-2 gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="size-4 text-gray-400" />
                                                        <span className="font-semibold text-gray-800 text-xs uppercase tracking-wider">Payment</span>
                                                    </div>
                                                    <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border">
                                                        {booking.paymentMethod}
                                                    </span>
                                                </div>
                                                <Select value={booking.paymentStatus} onValueChange={(val) => handleUpdateStatus(booking.bookingId, "paymentStatus", val)}>
                                                    <SelectTrigger className="h-8 text-xs font-bold tracking-wider">
                                                        <SelectValue placeholder="Payment Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                        <SelectItem value="Paid">Paid</SelectItem>
                                                        <SelectItem value="Refund in Progress">Refund in Progress</SelectItem>
                                                        <SelectItem value="Refunded">Refunded</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                                    View Listing
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
