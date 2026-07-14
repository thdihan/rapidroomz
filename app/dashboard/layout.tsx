import React from "react";
import { auth } from "@/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import NextAuthProvider from "@/components/shared/NextAuthProvider";

export const metadata = {
  title: "Dashboard - RapidRoomz",
  description: "View analytics, manage listings, payments and hotel bookings.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <NextAuthProvider>
      <DashboardShell initialUser={session?.user || undefined}>
        {children}
      </DashboardShell>
    </NextAuthProvider>
  );
}
