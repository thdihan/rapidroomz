"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  ChevronDown,
  FileText,
  Phone,
  MessageSquare,
} from "lucide-react";

export type UserRole = "admin" | "owner" | "user";

interface SubSidebarItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SubSidebarItem[];
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
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "about";

  // State to track expanded sub-menus (default settings open if on settings path)
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    "/dashboard/settings": true,
  });

  // State for unread customer queries count badge
  const [unreadQueriesCount, setUnreadQueriesCount] = useState<number>(0);

  useEffect(() => {
    if (role === "admin") {
      const fetchUnreadCount = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
          const res = await fetch(`${apiUrl}/contact`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const unread = json.data.filter((m: any) => m.status === "unread").length;
            setUnreadQueriesCount(unread);
          }
        } catch (err) {
          console.error("Error fetching unread queries count:", err);
        }
      };
      fetchUnreadCount();
    }
  }, [role, activePath]);

  const toggleSubMenu = (href: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  // Define menu options for each role
  const menuItems: Record<UserRole, SidebarItem[]> = {
    admin: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Manage Property", href: "/dashboard/properties", icon: Hotel },
      { label: "Manage Bookings", href: "/dashboard/bookings", icon: CalendarRange },
      { label: "User Directory", href: "/dashboard/users", icon: Users },
      { label: "Payment History", href: "/dashboard/payment-history", icon: CreditCard },
      { label: "Customer Queries", href: "/dashboard/customer-queries", icon: MessageSquare },
      {
        label: "Platform Settings",
        href: "/dashboard/settings",
        icon: Settings,
        children: [
          { label: "About Us Content", href: "/dashboard/settings?tab=about", icon: FileText },
          { label: "Contact Info", href: "/dashboard/settings?tab=contact_info", icon: Phone },
        ],
      },
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
    return activePath.startsWith(href.split("?")[0]);
  };

  const isSubItemActive = (subHref: string) => {
    const urlParams = new URLSearchParams(subHref.split("?")[1] || "");
    const subTab = urlParams.get("tab");
    if (!subTab) return false;
    return activePath.startsWith("/dashboard/settings") && activeTab === subTab;
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
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openSubMenus[item.href] ?? true;
            const Icon = item.icon;
            const isQueriesItem = item.href === "/dashboard/customer-queries";

            return (
              <div key={index} className="space-y-0.5">
                <Link
                  href={item.href}
                  onClick={() => {
                    if (hasChildren) {
                      toggleSubMenu(item.href);
                    }
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold transition-all relative cursor-pointer ${
                    isActive
                      ? "bg-[#1b5cac]/5 text-[#1b5cac] font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
                  }`}
                >
                  {/* Active Indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#1b5cac]" />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon
                      className={`size-4.5 shrink-0 transition-colors ${
                        isActive
                          ? "text-[#1b5cac]"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {/* Unread Queries Badge */}
                  {isQueriesItem && unreadQueriesCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold h-4 min-w-4 px-1.5 rounded-full flex items-center justify-center shadow-xs">
                      {unreadQueriesCount}
                    </span>
                  )}

                  {hasChildren && (
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  )}
                </Link>

                {/* Sub-menu Items with Smooth Accordion Transition */}
                {hasChildren && (
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 py-0.5"
                        : "grid-rows-[0fr] opacity-0 py-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pl-3.5 ml-4 space-y-1 py-1 border-l border-slate-200/80">
                        {item.children!.map((sub, subIndex) => {
                          const isSubActive = isSubItemActive(sub.href);
                          const SubIcon = sub.icon;

                          return (
                            <Link
                              key={subIndex}
                              href={sub.href}
                              onClick={onCloseMobile}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                                isSubActive
                                  ? "bg-[#1b5cac] text-white font-bold shadow-xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                            >
                              {SubIcon && <SubIcon className="size-3.5 shrink-0" />}
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
