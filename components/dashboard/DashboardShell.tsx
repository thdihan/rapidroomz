"use client";

import React, { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShieldAlert, LogOut, ChevronRight, User as UserIcon } from "lucide-react";
import DashboardSidebar, { UserRole } from "./DashboardSidebar";
import UserMenu from "@/components/shared/UserMenu";
import Link from "next/link";

// Context to share current active role state across all child pages
interface DashboardRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const DashboardRoleContext = createContext<DashboardRoleContextType | null>(null);

export function useDashboardRole() {
  const context = useContext(DashboardRoleContext);
  if (!context) {
    throw new Error("useDashboardRole must be used within a DashboardRoleProvider");
  }
  return context;
}

interface DashboardShellProps {
  initialUser?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  children: React.ReactNode;
}

export default function DashboardShell({ initialUser, children }: DashboardShellProps) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active role state, defaults to session role or "admin" as fallback for rich visualization
  const [role, setRole] = useState<UserRole>(
    (initialUser?.role as UserRole) || (isDemoMode ? "admin" : "user")
  );

  const pathname = usePathname();

  // Dynamic breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }];

    // Simple mapping for clean relative paths
    const pathLabels: Record<string, string> = {
      "payment-history": "View Payment History",
      "hotels": "Manage Hotels",
      "my-hotels": "My Hotels",
      "bookings": "Manage Bookings",
      "bookings-received": "Bookings Received",
      "users": "User Directory",
      "settings": "Platform Settings",
      "customer-queries": "Customer Queries",
      "revenue": "Revenue & Earnings",
      "my-bookings": "My Bookings",
      "saved": "Saved Hotels",
      "profile": "My Profile",
    };

    if (parts.length > 1) {
      const subpath = parts[1];
      if (pathLabels[subpath]) {
        breadcrumbs.push({
          label: pathLabels[subpath],
          href: `/dashboard/${subpath}`,
        });
      } else {
        breadcrumbs.push({
          label: subpath.charAt(0).toUpperCase() + subpath.slice(1).replace(/-/g, " "),
          href: `/dashboard/${subpath}`,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Mock user if NextAuth session is empty for developer local testing
  const activeUser = initialUser || {
    name: isDemoMode ? "John Doe" : "Guest",
    email: isDemoMode ? "john@rapidroomz.com" : "",
    role: isDemoMode ? "admin" : "user",
  };

  return (
    <DashboardRoleContext.Provider value={{ role, setRole }}>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:block h-full shrink-0">
          <DashboardSidebar role={role} activePath={pathname} />
        </div>

        {/* Mobile Sidebar overlay/drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="w-64 h-full animate-slide-in-left">
              <DashboardSidebar
                role={role}
                activePath={pathname}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
              />
            </div>
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar Header */}
          <header className="h-16 shrink-0 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 shadow-sm select-none z-10">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors md:hidden cursor-pointer"
              >
                <Menu className="size-5" />
              </button>

              {/* Dynamic Path Breadcrumbs */}
              <nav className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-muted-foreground">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={index}>
                      {index > 0 && <ChevronRight className="size-4 text-muted-foreground/60" />}
                      {isLast ? (
                        <span className="text-foreground font-bold truncate max-w-[120px] sm:max-w-none">
                          {crumb.label}
                        </span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="hover:text-foreground transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>

            {/* Top Bar Right: Sandbox switch & Profile drop */}
            <div className="flex items-center gap-4">
              {/* Role Switcher Sandbox for high-fidelity testing */}
              {isDemoMode && (
                <div className="hidden sm:flex items-center bg-slate-100/80 border border-border/80 p-1.2 rounded-lg gap-1.5 shadow-inner">
                  <span className="text-[10px] font-bold text-muted-foreground/75 px-1.5 uppercase tracking-widest flex items-center gap-1 select-none">
                    <ShieldAlert className="size-3 text-[#f5a124]" />
                    Preview:
                  </span>
                  {(["admin", "owner", "user"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`px-2.5 py-1 text-[11px] font-extrabold uppercase rounded-md transition-all cursor-pointer ${role === r
                        ? "bg-[#1b5cac] text-white shadow-sm"
                        : "text-muted-foreground/80 hover:text-foreground hover:bg-white/60"
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              {/* Mobile role pill indicator (interactive) */}
              {isDemoMode && (
                <button
                  onClick={() => {
                    const roles: UserRole[] = ["admin", "owner", "user"];
                    const nextIndex = (roles.indexOf(role) + 1) % roles.length;
                    setRole(roles[nextIndex]);
                  }}
                  className="flex sm:hidden px-2.5 py-1 text-[10px] font-extrabold uppercase bg-slate-100 border border-border rounded-md text-primary cursor-pointer active:scale-95 transition-transform"
                >
                  Role: {role}
                </button>
              )}

              {isDemoMode && <div className="h-6 w-px bg-border hidden sm:block" />}

              {/* User Dropdown */}
              <UserMenu user={activeUser} />
            </div>
          </header>

          {/* Page Body Viewport */}
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-8xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardRoleContext.Provider>
  );
}
