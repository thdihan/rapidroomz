"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";

import HotelForm from "@/components/properties/HotelForm";
import VillaForm from "@/components/properties/VillaForm";
import ApartmentForm from "@/components/properties/ApartmentForm";
import ResortForm from "@/components/properties/ResortForm";

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const propertyId = unwrappedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyType = searchParams.get("type") || "hotel";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const response = await fetch(`${apiUrl}/${propertyType}/${propertyId}`);
        if (!response.ok) throw new Error('Failed to fetch property details');
        
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, propertyType]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading property details for edit...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        <p className="mb-4">Error loading property: {error}</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="size-5" />
        </Button>
        <DashboardHeader 
          title={`Edit ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}`} 
          description="Update property details, pricing, and configurations." 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {propertyType === 'hotel' && <HotelForm initialData={data} />}
        {propertyType === 'villa' && <VillaForm initialData={data} />}
        {propertyType === 'apartment' && <ApartmentForm initialData={data} />}
        {propertyType === 'resort' && <ResortForm initialData={data} />}
      </div>
    </div>
  );
}
