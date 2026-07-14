"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, Construction, Info } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import HotelForm from "@/components/properties/HotelForm";
import VillaForm from "@/components/properties/VillaForm";
import ApartmentForm from "@/components/properties/ApartmentForm";
import ResortForm from "@/components/properties/ResortForm";

export default function CreatePropertyTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const resolvedParams = use(params);
  const propertyType = resolvedParams.type;

  return (
    <div className="space-y-6 animate-fade-in max-w-8xl mx-auto">
      <DashboardHeader
        title={`Create New ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}`}
        description={`Fill in the details below to list your ${propertyType} on RapidRoomz.`}
        action={
          <Link href="/dashboard/properties/create">
            <Button variant="outline" className="h-9 px-4 text-xs font-bold flex items-center gap-1.5">
              <ArrowLeft className="size-4" />
              Back to Types
            </Button>
          </Link>
        }
      />

      {propertyType === 'hotel' ? (
        <HotelForm />
      ) : propertyType === 'villa' ? (
        <VillaForm />
      ) : propertyType === 'apartment' ? (
        <ApartmentForm />
      ) : propertyType === 'resort' ? (
        <ResortForm />
      ) : (
        <div className="bg-white rounded-xl border border-border p-8 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <div className="size-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Construction className="size-8" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">
            Form Under Construction
          </h2>
          <p className="text-sm font-medium text-muted-foreground max-w-md mx-auto mb-6">
            The specific property creation form for <strong>{propertyType}</strong> is currently being developed. We have successfully navigated to the skeleton page as requested.
          </p>

          <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-sm font-semibold max-w-lg w-full text-left">
            <Info className="size-5 shrink-0" />
            <p>
              You can implement the final form components (amenities, location dropdowns, pricing matrix, image uploads) in this file later.
            </p>
          </div>

          <Link href="/dashboard/properties" className="mt-8">
            <Button className="h-10 px-6 bg-[#1b5cac] hover:bg-[#1b5cac]/90 shadow-sm text-white font-extrabold">
              Return to Directory
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
