"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CommonTable, { Column } from "@/components/dashboard/CommonTable";
import { Button } from "@/components/ui/button";
import { Eye, CalendarRange, User, CreditCard, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AllBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${API_URL}/booking/all`);
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

  const columns: Column<any>[] = [
    {
      header: "Booking ID",
      accessorKey: "bookingId",
      className: "w-[120px] font-bold text-[#1b5cac]",
    },
    {
      header: "Property Name",
      accessorKey: "propertyName",
      className: "font-semibold text-foreground text-sm",
    },
    {
      header: "Property Type",
      className: "text-xs uppercase font-bold tracking-wider",
      render: (item) => (
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {item.propertyType}
        </span>
      ),
    },
    {
      header: "Guest Info",
      render: (item) => (
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-foreground truncate text-sm">
            {item.contactInfo?.name || "N/A"}
          </span>
          <span className="text-xs font-semibold text-muted-foreground truncate">
            {item.contactInfo?.phone || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Total Amount",
      className: "font-extrabold text-foreground text-sm",
      render: (item) => `৳ ${item.totalAmount?.toLocaleString() || 0}`,
    },
    {
      header: "Status",
      render: (item) => {
        const badges: Record<string, string> = {
          Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
          Pending: "bg-amber-50 text-amber-700 border-amber-200/50",
          Cancelled: "bg-rose-50 text-rose-700 border-rose-200/50",
        };
        const statusStr = item.status || "Pending";
        return (
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full border inline-flex items-center justify-center ${
              badges[statusStr] || "bg-slate-50 text-slate-700 border-slate-200/50"
            }`}
          >
            {statusStr}
          </span>
        );
      },
    },
    {
      header: "Actions",
      className: "text-right w-[100px]",
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedBooking(item)}
          className="h-8 px-3 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Eye className="size-3.5" />
          <span>Details</span>
        </Button>
      ),
    },
  ];

  // Pagination Logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(bookings.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return bookings.slice(startIndex, startIndex + itemsPerPage);
  }, [bookings, currentPage]);

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader
        title="Manage Bookings"
        description="View and manage all reservations across the platform."
      />

      <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
        <CommonTable
          data={paginatedData}
          columns={columns}
          isLoading={loading}
          emptyMessage="No bookings found."
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            onPageChange: (page) => setCurrentPage(page),
            totalItems: bookings.length,
            itemsPerPage: itemsPerPage,
          }}
        />
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Booking ID</p>
                  <p className="font-bold">{selectedBooking.bookingId}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Booking Status</p>
                  <p className="font-bold">{selectedBooking.status}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                  <Building className="size-4 text-primary" />
                  Property Information
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="font-bold text-lg">{selectedBooking.propertyName}</p>
                  <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mt-1">
                    {selectedBooking.propertyType}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                    <User className="size-4 text-primary" />
                    Guest Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border space-y-1">
                    <p className="font-semibold">{selectedBooking.contactInfo?.name}</p>
                    <p className="text-sm">{selectedBooking.contactInfo?.email}</p>
                    <p className="text-sm">{selectedBooking.contactInfo?.phone}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                    <CreditCard className="size-4 text-primary" />
                    Payment Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Method</span>
                      <span className="font-semibold text-sm">{selectedBooking.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className="font-semibold text-sm">{selectedBooking.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t">
                      <span className="text-sm font-bold text-gray-700">Total</span>
                      <span className="font-extrabold text-lg text-primary">
                        ৳ {selectedBooking.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
