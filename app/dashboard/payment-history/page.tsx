"use client";

import React, { useState, useMemo } from "react";
import { useDashboardRole } from "@/components/dashboard/DashboardShell";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CommonTable, { Column } from "@/components/dashboard/CommonTable";
import {
  CreditCard,
  Search,
  Download,
  Filter,
  RefreshCw,
  Building,
  Coins,
  ArrowDownToLine,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// -------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------
interface PaymentRecord {
  id: string;
  hotelName: string;
  roomInfo: string;
  guestName: string;
  date: string;
  amount: string;
  method: "bKash" | "Nagad" | "Credit Card" | "Bank Transfer";
  status: "paid" | "pending" | "refunded";
  txVal: number;
}

// -------------------------------------------------------------
// Payment History Page Component
// -------------------------------------------------------------
export default function PaymentHistoryPage() {
  const { role } = useDashboardRole();

  // Component States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "pending" | "refunded">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // -----------------------------------------------------------
  // Master Payment History Database (Simulating server records)
  // -----------------------------------------------------------
  const paymentsDatabase: Record<"admin" | "owner" | "user", PaymentRecord[]> = {
    admin: [
      {
        id: "TXN-10025",
        hotelName: "Radisson Blu Water Garden",
        roomInfo: "Deluxe Suite Room",
        guestName: "Tanvir Rahman",
        date: "May 26, 2026",
        amount: "৳ 14,500",
        txVal: 14500,
        method: "bKash",
        status: "paid",
      },
      {
        id: "TXN-10024",
        hotelName: "Sayeman Beach Resort",
        roomInfo: "Ocean View Executive",
        guestName: "Farhana Karim",
        date: "May 25, 2026",
        amount: "৳ 24,000",
        txVal: 24000,
        method: "Credit Card",
        status: "paid",
      },
      {
        id: "TXN-10023",
        hotelName: "The Palace Luxury Resort",
        roomInfo: "Presidential Villa",
        guestName: "S.M. Kamal",
        date: "May 24, 2026",
        amount: "৳ 32,500",
        txVal: 32500,
        method: "Nagad",
        status: "pending",
      },
      {
        id: "TXN-10022",
        hotelName: "Long Beach Hotel Cox's Bazar",
        roomInfo: "Deluxe Twin Room",
        guestName: "Imtiaz Ahmed",
        date: "May 23, 2026",
        amount: "৳ 11,200",
        txVal: 11200,
        method: "bKash",
        status: "refunded",
      },
      {
        id: "TXN-10021",
        hotelName: "Momo Inn Bogra",
        roomInfo: "Premium King Room",
        guestName: "Naila Chowdhury",
        date: "May 22, 2026",
        amount: "৳ 8,900",
        txVal: 8900,
        method: "Bank Transfer",
        status: "paid",
      },
      {
        id: "TXN-10020",
        hotelName: "Grand Sultan Tea Resort",
        roomInfo: "Royal Suite",
        guestName: "Zubayer Alom",
        date: "May 19, 2026",
        amount: "৳ 45,000",
        txVal: 45000,
        method: "Credit Card",
        status: "paid",
      },
      {
        id: "TXN-10019",
        hotelName: "Hotel Seagull Cox's Bazar",
        roomInfo: "Regular Double",
        guestName: "Anisur Rahman",
        date: "May 18, 2026",
        amount: "৳ 7,500",
        txVal: 7500,
        method: "Nagad",
        status: "pending",
      },
    ],
    owner: [
      {
        id: "TXN-10024",
        hotelName: "Sayeman Beach Resort",
        roomInfo: "Ocean View Executive",
        guestName: "Farhana Karim",
        date: "May 25, 2026",
        amount: "৳ 24,000",
        txVal: 24000,
        method: "Credit Card",
        status: "paid",
      },
      {
        id: "TXN-10015",
        hotelName: "Sayeman Beach Resort",
        roomInfo: "Deluxe Twin Room",
        guestName: "Ashikur Rahman",
        date: "May 21, 2026",
        amount: "৳ 16,500",
        txVal: 16500,
        method: "bKash",
        status: "paid",
      },
      {
        id: "TXN-10012",
        hotelName: "Sayeman Beach Resort",
        roomInfo: "Presidential Suite",
        guestName: "S.M. Kamal",
        date: "May 19, 2026",
        amount: "৳ 55,000",
        txVal: 55000,
        method: "Credit Card",
        status: "paid",
      },
      {
        id: "TXN-10008",
        hotelName: "Sayeman Beach Resort",
        roomInfo: "Ocean Suite Deluxe",
        guestName: "Naila Chowdhury",
        date: "May 15, 2026",
        amount: "৳ 28,000",
        txVal: 28000,
        method: "Bank Transfer",
        status: "refunded",
      },
      {
        id: "TXN-10002",
        hotelName: "Sayeman Beach Resort",
        roomInfo: "Regular Couple Room",
        guestName: "Imtiaz Ahmed",
        date: "May 10, 2026",
        amount: "৳ 9,500",
        txVal: 9500,
        method: "Nagad",
        status: "paid",
      },
    ],
    user: [
      {
        id: "TXN-10025",
        hotelName: "Radisson Blu Water Garden",
        roomInfo: "Deluxe Suite Room",
        guestName: "Tanvir Rahman",
        date: "May 26, 2026",
        amount: "৳ 14,500",
        txVal: 14500,
        method: "bKash",
        status: "paid",
      },
      {
        id: "TXN-09884",
        hotelName: "Sayeman Beach Resort",
        roomInfo: "Ocean View Executive",
        guestName: "Tanvir Rahman",
        date: "Apr 12, 2026",
        amount: "৳ 24,000",
        txVal: 24000,
        method: "Credit Card",
        status: "paid",
      },
      {
        id: "TXN-09552",
        hotelName: "Sreemangal Bilash Luxury Hotel",
        roomInfo: "Eco Cottage",
        guestName: "Tanvir Rahman",
        date: "Jan 08, 2026",
        amount: "৳ 9,800",
        txVal: 9800,
        method: "Nagad",
        status: "paid",
      },
      {
        id: "TXN-09221",
        hotelName: "Momo Inn Bogra",
        roomInfo: "Premium King Room",
        guestName: "Tanvir Rahman",
        date: "Dec 14, 2025",
        amount: "৳ 8,900",
        txVal: 8900,
        method: "bKash",
        status: "paid",
      },
      {
        id: "TXN-08990",
        hotelName: "Hotel Seagull Cox's Bazar",
        roomInfo: "Regular Double Room",
        guestName: "Tanvir Rahman",
        date: "Nov 02, 2025",
        amount: "৳ 7,500",
        txVal: 7500,
        method: "bKash",
        status: "refunded",
      },
    ],
  };

  // Get active dataset based on role
  const activeDataset = useMemo(() => {
    return paymentsDatabase[role] || paymentsDatabase.user;
  }, [role]);

  // Handle refresh action
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Filtered dataset combining query & status tab selection
  const filteredData = useMemo(() => {
    return activeDataset.filter((item) => {
      // 1. Status Filter
      if (activeTab !== "all" && item.status !== activeTab) {
        return false;
      }
      // 2. Query search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(query) ||
          item.hotelName.toLowerCase().includes(query) ||
          item.guestName.toLowerCase().includes(query) ||
          item.roomInfo.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeDataset, activeTab, searchQuery]);

  // Aggregate totals
  const aggregates = useMemo(() => {
    const totalTransactions = filteredData.length;
    const paidSum = filteredData
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.txVal, 0);
    const pendingSum = filteredData
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.txVal, 0);

    return {
      count: totalTransactions,
      paid: `৳ ${paidSum.toLocaleString()}`,
      pending: `৳ ${pendingSum.toLocaleString()}`,
    };
  }, [filteredData]);

  // -----------------------------------------------------------
  // Columns Specification for CommonTable
  // -----------------------------------------------------------
  const columns: Column<PaymentRecord>[] = [
    {
      header: "Transaction ID",
      accessorKey: "id",
      className: "w-[125px] font-bold text-[#1b5cac]",
      render: (item) => (
        <span className="flex items-center gap-1">
          {item.id}
          <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      ),
    },
    {
      header: "Hotel & Accommodation",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="size-9 bg-slate-100 flex items-center justify-center rounded-lg text-slate-500 border border-slate-200/50 shrink-0">
            <Building className="size-4.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate text-sm">
              {item.hotelName}
            </span>
            <span className="text-xs font-semibold text-muted-foreground truncate">
              {item.roomInfo}
            </span>
          </div>
        </div>
      ),
    },
    // Hide guest name column if viewing as normal Customer (since they are always the guest)
    ...(role !== "user"
      ? [
          {
            header: "Customer Name",
            accessorKey: "guestName",
            className: "font-semibold text-foreground text-sm",
          },
        ]
      : []),
    {
      header: "Execution Date",
      accessorKey: "date",
      className: "text-muted-foreground",
    },
    {
      header: "Gateway Method",
      render: (item) => {
        const methods: Record<string, string> = {
          bKash: "bg-pink-50 text-pink-700 border-pink-200/50",
          Nagad: "bg-orange-50 text-orange-700 border-orange-200/50",
          "Credit Card": "bg-blue-50 text-blue-700 border-blue-200/50",
          "Bank Transfer": "bg-slate-50 text-slate-700 border-slate-200/50",
        };
        return (
          <span
            className={`px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded border ${
              methods[item.method] || "bg-slate-50"
            }`}
          >
            {item.method}
          </span>
        );
      },
    },
    {
      header: "Total Billing",
      accessorKey: "amount",
      className: "font-extrabold text-foreground text-sm",
    },
    {
      header: "Payment Status",
      className: "w-[120px]",
      render: (item) => {
        const badges = {
          paid: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
          pending: "bg-amber-50 text-amber-700 border-amber-200/50",
          refunded: "bg-rose-50 text-rose-700 border-rose-200/50",
        };
        const labels = {
          paid: "Settled Paid",
          pending: "Awaiting Appr.",
          refunded: "Refund Completed",
        };
        return (
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full border flex items-center justify-center gap-1 ${
              badges[item.status]
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                item.status === "paid"
                  ? "bg-emerald-600"
                  : item.status === "pending"
                  ? "bg-amber-600"
                  : "bg-rose-600"
              }`}
            />
            {labels[item.status]}
          </span>
        );
      },
    },
    {
      header: "Receipt",
      className: "text-right w-[100px]",
      render: () => (
        <Button
          variant="outline"
          size="sm"
          className="h-8.5 px-3 border-border hover:bg-slate-50 cursor-pointer shadow-none rounded-sm transition-colors text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <ArrowDownToLine className="size-3.5" />
          <span>PDF</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <DashboardHeader
        title="Payment History"
        description="Review all cash transactions, bKash automated approvals, refunds, and bank ledger records."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className={`h-9 w-9 p-0 border-border bg-white cursor-pointer hover:bg-slate-50 hover:text-foreground transition-all shadow-none rounded-sm flex items-center justify-center ${
                isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"
              }`}
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button className="h-9.5 px-4 bg-[#1b5cac] hover:bg-[#1b5cac]/90 shadow-sm shadow-[#1b5cac]/10 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer rounded-sm border-0">
              <Download className="size-4" />
              <span>Export Ledger</span>
            </Button>
          </div>
        }
      />

      {/* Dynamic Summary Cards for filtered entries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-border p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-lg text-slate-500 border border-slate-100">
            <Filter className="size-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Listed Records
            </span>
            <h4 className="text-xl font-extrabold text-foreground mt-0.5">
              {aggregates.count} entries
            </h4>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
            <Coins className="size-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Settled Earnings
            </span>
            <h4 className="text-xl font-extrabold text-foreground mt-0.5">
              {aggregates.paid}
            </h4>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
            <CreditCard className="size-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Awaiting Approvals
            </span>
            <h4 className="text-xl font-extrabold text-foreground mt-0.5">
              {aggregates.pending}
            </h4>
          </div>
        </div>
      </div>

      {/* Filters and Search controls */}
      <div className="bg-white border border-border rounded-lg p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab Selector pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { id: "all", label: "All Transactions" },
                { id: "paid", label: "Paid" },
                { id: "pending", label: "Pending" },
                { id: "refunded", label: "Refunded" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[#1b5cac]/10 text-[#1b5cac]"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Txn ID, Hotel..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9.5 text-sm font-semibold border-border focus-visible:ring-1 focus-visible:ring-primary shadow-none bg-slate-50/50"
            />
          </div>
        </div>

        {/* Common Reusable Table populated with active items */}
        <CommonTable
          data={filteredData}
          columns={columns}
          isLoading={isRefreshing}
          emptyMessage="No payment transactions match the active filter criteria."
          pagination={{
            currentPage: currentPage,
            totalPages: Math.ceil(filteredData.length / 5) || 1,
            onPageChange: (page) => setCurrentPage(page),
            totalItems: filteredData.length,
            itemsPerPage: 5,
          }}
        />
      </div>
    </div>
  );
}
