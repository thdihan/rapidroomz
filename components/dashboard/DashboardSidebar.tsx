"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Hotel,
  CalendarRange,
  Users,
  CreditCard,
  Settings,
  Wallet,
  Heart,
  User,
  X,
  Building,
} from "lucide-react";

export type UserRole = "admin" | "owner" | "user";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardSidebarProps {
  role: UserRole;
  activePath: string;
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({
  role,
  activePath,
  onCloseMobile,
}: DashboardSidebarProps) {
  // Define menu options for each role
  const menuItems: Record<UserRole, SidebarItem[]> = {
    admin: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Manage Property", href: "/dashboard/properties", icon: Hotel },
      { label: "Manage Bookings", href: "/dashboard/bookings", icon: CalendarRange },
      { label: "User Directory", href: "/dashboard/users", icon: Users },
      { label: "Payment History", href: "/dashboard/payment-history", icon: CreditCard },
      { label: "Platform Settings", href: "/dashboard/settings", icon: Settings },
    ],
    owner: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Manage Property", href: "/dashboard/properties", icon: Hotel },
      { label: "Bookings Received", href: "/dashboard/bookings-received", icon: CalendarRange },
      { label: "Revenue & Earnings", href: "/dashboard/revenue", icon: Wallet },
      { label: "Payment History", href: "/dashboard/payment-history", icon: CreditCard },
    ],
    user: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Bookings", href: "/dashboard/my-bookings", icon: CalendarRange },
      { label: "Saved Hotels", href: "/dashboard/saved", icon: Heart },
      { label: "Payment History", href: "/dashboard/payment-history", icon: CreditCard },
      { label: "My Profile", href: "/dashboard/profile", icon: User },
    ],
  };

  const items = menuItems[role] || menuItems.user;

  // Helper to check if item is active
  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return activePath === "/dashboard";
    }
    return activePath.startsWith(href);
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-border flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-[#F9FAFB]/50">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            onClick={onCloseMobile}
          >
            <div className="size-9 bg-[#1b5cac] flex items-center justify-center rounded-lg shadow-sm shadow-[#1b5cac]/20 text-white">
              <Building className="size-5" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">
              Rapid<span className="text-primary">Roomz</span>
            </span>
          </Link>

          {/* Close button for mobile layout */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors md:hidden cursor-pointer"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Navigation Options */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Navigation Menu
            </span>
          </div>

          {items.map((item, index) => {
            const isActive = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={index}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all relative ${
                  isActive
                    ? "bg-[#1b5cac]/5 text-[#1b5cac] font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
                }`}
              >
                {/* Active Indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#1b5cac]" />
                )}

                <Icon
                  className={`size-4.5 shrink-0 transition-colors ${
                    isActive
                      ? "text-[#1b5cac]"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Indicator / Profile Badge at the bottom */}
      <div className="p-4 border-t border-border bg-[#F9FAFB]/50">
        <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-border shadow-sm">
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 uppercase">
            {role[0]}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Logged in as
            </span>
            <span className="text-xs font-bold text-foreground capitalize truncate">
              {role === "admin"
                ? "Administrator"
                : role === "owner"
                ? "Hotel Owner"
                : "Customer"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
