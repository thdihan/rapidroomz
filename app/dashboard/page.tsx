"use client";

import React, { useState } from "react";
import { useDashboardRole } from "@/components/dashboard/DashboardShell";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CommonTable, { Column } from "@/components/dashboard/CommonTable";
import {
  DollarSign,
  CalendarRange,
  Hotel,
  Users,
  TrendingUp,
  Award,
  Heart,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// -------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  date: string;
  status: "success" | "pending" | "failed";
}

// -------------------------------------------------------------
// StatCard UI Component
// -------------------------------------------------------------
function StatCard({ title, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-border p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg transition-transform group-hover:scale-105 ${color}`}>
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground text-slate-400">
          Coming Soon
        </h3>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground font-medium">Data will be available shortly</span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Main Dashboard Page
// -------------------------------------------------------------
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { role } = useDashboardRole();
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<ActivityItem[]>([]);
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  React.useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        let url = "";
        
        if (role === "admin") {
          url = `${API_URL}/booking/all`;
        } else if (role === "owner" && session?.user?.id) {
          url = `${API_URL}/booking/owner-bookings/${session.user.id}`;
        } else if (role === "user" && session?.user?.id) {
          url = `${API_URL}/booking/my-bookings/${session.user.id}`;
        }

        if (url) {
          const res = await fetch(url);
          const data = await res.json();
          if (data.success && data.data) {
            const mappedBookings: ActivityItem[] = data.data.map((b: any) => ({
              id: b.bookingId,
              title: b.propertyName,
              subtitle: role === "user" ? `Booked ${b.propertyType}` : `Guest: ${b.contactInfo?.name || 'Unknown'}`,
              amount: `৳ ${b.totalAmount?.toLocaleString() || 0}`,
              date: new Date(b.createdAt).toLocaleDateString(),
              status: b.status === "Confirmed" ? "success" : b.status === "Cancelled" ? "failed" : "pending",
              rawStatus: b.status
            })).slice(0, 5); // Just show top 5 for recent bookings
            setBookings(mappedBookings);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (session?.user || role === "admin") {
      fetchBookings();
    }
  }, [role, session]);

  // -----------------------------------------------------------
  // Dynamic Page Heading & Stat Cards Data
  // -----------------------------------------------------------
  const getHeaderDetails = () => {
    switch (role) {
      case "admin":
        return {
          title: "System Overview",
          desc: "Real-time analytics and management ledger for the entire platform.",
        };
      case "owner":
        return {
          title: "Merchant Dashboard",
          desc: "Analyze hotel analytics, active stays, and revenue trends.",
        };
      case "user":
      default:
        return {
          title: "Welcome back, Guest!",
          desc: "Manage your upcoming reservations, reward points, and payments.",
        };
    }
  };

  const getStats = (): StatCardProps[] => {
    switch (role) {
      case "admin":
        return [
          { title: "Total Platform Revenue", value: "", change: "", isPositive: true, icon: DollarSign, color: "bg-blue-50 text-blue-600" },
          { title: "Total Platform Bookings", value: "", change: "", isPositive: true, icon: CalendarRange, color: "bg-indigo-50 text-indigo-600" },
          { title: "Registered Hotels", value: "", change: "", isPositive: true, icon: Hotel, color: "bg-emerald-50 text-emerald-600" },
          { title: "Registered Users", value: "", change: "", isPositive: true, icon: Users, color: "bg-amber-50 text-[#f5a124]" },
        ];
      case "owner":
        return [
          { title: "Total Sales Revenue", value: "", change: "", isPositive: true, icon: DollarSign, color: "bg-blue-50 text-blue-600" },
          { title: "Bookings Received", value: "", change: "", isPositive: true, icon: CalendarRange, color: "bg-indigo-50 text-indigo-600" },
          { title: "Active Hotel Listings", value: "", change: "", isPositive: true, icon: Hotel, color: "bg-emerald-50 text-emerald-600" },
          { title: "Average Occupancy", value: "", change: "", isPositive: true, icon: TrendingUp, color: "bg-amber-50 text-[#f5a124]" },
        ];
      case "user":
      default:
        return [
          { title: "Bookings Completed", value: "", change: "", isPositive: true, icon: CalendarRange, color: "bg-indigo-50 text-indigo-600" },
          { title: "Total Paid Transactions", value: "", change: "", isPositive: true, icon: DollarSign, color: "bg-blue-50 text-blue-600" },
          { title: "Saved Hotels", value: "", change: "", isPositive: true, icon: Heart, color: "bg-rose-50 text-rose-600" },
          { title: "Earned Reward Points", value: "", change: "", isPositive: true, icon: Award, color: "bg-amber-50 text-[#f5a124]" },
        ];
    }
  };

  const getTableTitle = () => {
    switch (role) {
      case "admin":
        return "Recent Booking Actions";
      case "owner":
        return "Recent Bookings Received";
      case "user":
      default:
        return "My Recent Booking Activity";
    }
  };

  const columns: Column<ActivityItem>[] = [
    {
      header: "Booking ID",
      accessorKey: "id",
      className: "w-[120px] font-bold text-[#1b5cac]",
    },
    {
      header: "Details",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-sm">{item.title}</span>
          <span className="text-xs font-semibold text-muted-foreground">{item.subtitle}</span>
        </div>
      ),
    },
    {
      header: "Booked On",
      accessorKey: "date",
      className: "text-muted-foreground",
    },
    {
      header: "Total Cost",
      accessorKey: "amount",
      className: "font-bold text-foreground",
    },
    {
      header: "Booking Status",
      render: (item) => {
        const styles = {
          success: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
          pending: "bg-amber-50 text-amber-700 border-amber-200/50",
          failed: "bg-rose-50 text-rose-700 border-rose-200/50",
        };
        const labels = {
          success: "Confirmed",
          pending: "Pending",
          failed: "Cancelled",
        };
        return (
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
              styles[item.status]
            }`}
          >
            {(item as any).rawStatus || labels[item.status]}
          </span>
        );
      },
    },
    {
      header: "Action",
      className: "text-right w-[100px]",
      render: (item) => (
        <Link
          href={role === 'admin' ? '/dashboard/bookings' : role === 'owner' ? '/dashboard/bookings-received' : '/dashboard/my-bookings'}
          className="inline-flex items-center gap-0.5 text-xs font-bold text-[#1b5cac] hover:underline"
        >
          <span>View All</span>
          <ChevronRight className="size-3" />
        </Link>
      ),
    },
  ];

  const header = getHeaderDetails();
  const stats = getStats();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Header */}
      <DashboardHeader
        title={header.title}
        description={header.desc}
        action={
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-muted-foreground">Live Server Session</span>
          </div>
        }
      />

      {/* Developer Environment Banner */}
      {isDemoMode && (
        <div className="bg-[#f2f7fd] border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-3">
            <div className="p-2 rounded-md bg-[#1b5cac]/10 text-[#1b5cac] shrink-0 self-start sm:self-center">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Sandbox Demo Mode Active</h4>
              <p className="text-xs font-semibold text-[#1b5cac] mt-0.5">
                Toggling user roles at the top right dynamically filters menus, statistics, and tabular ledgers to simulate complete Admin, Owner, and Customer workflows!
              </p>
            </div>
          </div>
          <Link href="/dashboard/payment-history">
            <Button className="h-8.5 px-4 bg-[#1b5cac] hover:bg-[#1b5cac]/90 shadow-sm shadow-[#1b5cac]/10 text-white text-xs font-extrabold uppercase tracking-wider shrink-0 cursor-pointer rounded-sm border-0">
              View Payment History
            </Button>
          </Link>
        </div>
      )}

      {/* Grid statistics layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Data Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Clock className="size-4.5 text-muted-foreground" />
            {getTableTitle()}
          </h2>
          <Link
            href={role === 'admin' ? '/dashboard/bookings' : role === 'owner' ? '/dashboard/bookings-received' : '/dashboard/my-bookings'}
            className="text-xs font-bold text-[#1b5cac] hover:underline flex items-center gap-0.5"
          >
            <span>View All Records</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {/* Common Reusable Table Component */}
        <CommonTable
          data={bookings}
          columns={columns}
          isLoading={loading}
          emptyMessage="No recent bookings found."
          pagination={{
            currentPage: currentPage,
            totalPages: 1,
            onPageChange: (p) => setCurrentPage(p),
            totalItems: bookings.length,
            itemsPerPage: 5,
          }}
        />
      </div>
    </div>
  );
}
