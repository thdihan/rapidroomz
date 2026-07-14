"use client";

import React from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm font-semibold text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center shrink-0 gap-2">{action}</div>}
    </div>
  );
}
