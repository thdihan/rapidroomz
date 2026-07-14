"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Building, MapPin, DollarSign, Hotel } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CommonTable, { Column } from "@/components/dashboard/CommonTable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface PropertyItem {
  _id: string;
  name: string;
  type: string;
  location: string;
  pricePerNight: number;
  isFeatured: boolean;
}

export default function PropertiesPage() {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    const fetchProperties = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        
        const role = (session?.user as any)?.role;
        const ownerIdQuery = role === 'owner' ? `?ownerId=${(session?.user as any)?.id}` : '';

        const [hotelResponse, villaResponse, apartmentResponse, resortResponse] = await Promise.all([
          fetch(`${apiUrl}/hotel${ownerIdQuery}`),
          fetch(`${apiUrl}/villa${ownerIdQuery}`),
          fetch(`${apiUrl}/apartment${ownerIdQuery}`),
          fetch(`${apiUrl}/resort${ownerIdQuery}`)
        ]);

        const mappedProperties: PropertyItem[] = [];

        if (hotelResponse.ok) {
          const hotelResult = await hotelResponse.json();
          if (hotelResult.success && hotelResult.data) {
            mappedProperties.push(...hotelResult.data.map((hotel: any) => ({
              _id: hotel._id,
              name: hotel.name,
              type: "hotel",
              location: hotel.address ? `${hotel.address.city}, ${hotel.address.country}` : "N/A",
              pricePerNight: 0, // Rates are variable based on room types
              isFeatured: hotel.isFeatured || false,
            })));
          }
        }

        if (villaResponse.ok) {
          const villaResult = await villaResponse.json();
          if (villaResult.success && villaResult.data) {
            mappedProperties.push(...villaResult.data.map((villa: any) => ({
              _id: villa._id,
              name: villa.propertyName,
              type: "villa",
              location: villa.address ? `${villa.address.city}, ${villa.address.country}` : "N/A",
              pricePerNight: villa.propertyDetails?.basePrice || 0,
              isFeatured: villa.isFeatured || false,
            })));
          }
        }

        if (apartmentResponse.ok) {
          const apartmentResult = await apartmentResponse.json();
          if (apartmentResult.success && apartmentResult.data) {
            mappedProperties.push(...apartmentResult.data.map((apt: any) => ({
              _id: apt._id,
              name: apt.propertyName,
              type: "apartment",
              location: apt.address ? `${apt.address.city}, ${apt.address.country}` : "N/A",
              pricePerNight: apt.propertyDetails?.basePrice || 0,
              isFeatured: apt.isFeatured || false,
            })));
          }
        }

        if (resortResponse.ok) {
          const resortResult = await resortResponse.json();
          if (resortResult.success && resortResult.data) {
            mappedProperties.push(...resortResult.data.map((resort: any) => ({
              _id: resort._id,
              name: resort.propertyName,
              type: "resort",
              location: resort.address ? `${resort.address.city}, ${resort.address.country}` : "N/A",
              pricePerNight: 0, // Resorts have roomTypes with their own prices
              isFeatured: resort.isFeatured || false,
            })));
          }
        }

        setProperties(mappedProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [session, status]);

  const toggleFeatured = async (id: string, type: string, newStatus: boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/${type}/${id}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: newStatus })
      });

      if (response.ok) {
        setProperties(prev => prev.map(p => p._id === id ? { ...p, isFeatured: newStatus } : p));
        toast.success(`Property ${newStatus ? 'featured' : 'unfeatured'} successfully.`);
      } else {
        toast.error("Failed to update featured status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating status.");
    }
  };

  const columns: Column<PropertyItem>[] = [
    {
      header: "Property Name",
      accessorKey: "name",
      className: "font-bold text-foreground",
    },
    {
      header: "Type",
      render: (item) => (
        <span className="capitalize px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200/50">
          {item.type}
        </span>
      ),
    },
    {
      header: "Location",
      render: (item) => (
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="size-3.5" />
          <span>{item.location}</span>
        </div>
      ),
    },
    {
      header: "Price / Night",
      render: (item) => (
        <div className="flex items-center gap-1 font-bold text-foreground">
          <span>{item.pricePerNight === 0 ? "Variable Rates" : `৳ ${item.pricePerNight.toLocaleString()}`}</span>
        </div>
      ),
    },
    {
      header: "Featured",
      render: (item) => (
        <Switch 
          checked={item.isFeatured} 
          onCheckedChange={(checked) => toggleFeatured(item._id, item.type, checked)} 
        />
      ),
    },
    {
      header: "Action",
      className: "text-right w-[100px]",
      render: (item) => (
        <Link
          href={`/dashboard/properties/${item._id}?type=${item.type}`}
          className="inline-flex items-center gap-0.5 text-xs font-bold text-[#1b5cac] hover:underline"
        >
          <span>Manage</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader
        title="Manage Properties"
        description="View and manage all your listed properties across the platform."
        action={
          <Link href="/dashboard/properties/create">
            <Button className="h-9 px-4 bg-[#1b5cac] hover:bg-[#1b5cac]/90 shadow-sm text-white text-xs font-extrabold tracking-wide cursor-pointer rounded-md border-0 flex items-center gap-1.5">
              <Plus className="size-4" />
              Create Property
            </Button>
          </Link>
        }
      />

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-[#F9FAFB]/50">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Hotel className="size-4.5 text-muted-foreground" />
            Property Directory
          </h3>
        </div>
        <div className="p-0">
          <CommonTable
            data={properties}
            columns={columns}
            isLoading={loading}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              onPageChange: () => {},
              totalItems: properties.length,
              itemsPerPage: 10,
            }}
          />
        </div>
      </div>
    </div>
  );
}
