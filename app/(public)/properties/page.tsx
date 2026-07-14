"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HotelCard from "@/components/hotels/HotelCard";
import SearchBar from "@/components/shared/SearchBar";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldGroup,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";

const amenities = [
    "WiFi",
    "Pool",
    "Spa",
    "Restaurant",
    "Gym",
    "Beach",
    "Bar",
    "Breakfast",
];

const propertyTypes = [
    { id: "hotel", label: "Hotel" },
    { id: "villa", label: "Villa" },
    { id: "apartment", label: "Apartment" },
    { id: "resort", label: "Resort" },
];

function PropertiesContent() {
    const searchParams = useSearchParams();
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
                
                const searchLocation = searchParams.get("location");
                const searchCheckIn = searchParams.get("checkIn");
                const searchCheckOut = searchParams.get("checkOut");
                const searchGuests = searchParams.get("guests");
                const searchType = searchParams.get("type");

                let allProperties = [];

                if (searchCheckIn && searchCheckOut && searchGuests) {
                    // Use the Search API
                    const query = new URLSearchParams({
                        checkIn: searchCheckIn,
                        checkOut: searchCheckOut,
                        guests: searchGuests
                    });
                    if (searchLocation) query.append("location", searchLocation);
                    if (searchType) query.append("type", searchType);

                    const res = await fetch(`${apiUrl}/search?${query.toString()}`);
                    const data = await res.json();
                    
                    if (data.success) {
                        allProperties = data.data.map((p: any) => ({
                            id: p._id,
                            name: p.name,
                            type: p.type,
                            location: p.address ? `${p.address.city}, ${p.address.country}` : "N/A",
                            rating: p.starRating || 5,
                            reviews: Math.floor(Math.random() * 200) + 10,
                            price: p.minPrice || 150,
                            availableCapacity: p.availableCapacity,
                            image: p.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=450&fit=crop',
                            amenities: ["WiFi"], // Could be populated from DB, but keeping it simple
                            featured: false
                        }));
                    }
                } else {
                    // Regular fetch
                    const [hotelRes, villaRes, aptRes, resortRes] = await Promise.all([
                        fetch(`${apiUrl}/hotel`).catch(() => null),
                        fetch(`${apiUrl}/villa`).catch(() => null),
                        fetch(`${apiUrl}/apartment`).catch(() => null),
                        fetch(`${apiUrl}/resort`).catch(() => null),
                    ]);

                    const hotelsData = hotelRes && hotelRes.ok ? await hotelRes.json() : { data: [] };
                    const villasData = villaRes && villaRes.ok ? await villaRes.json() : { data: [] };
                    const aptsData = aptRes && aptRes.ok ? await aptRes.json() : { data: [] };
                    const resortsData = resortRes && resortRes.ok ? await resortRes.json() : { data: [] };

                    allProperties = [
                        ...(hotelsData.data || []).map((h: any) => ({
                            id: h._id,
                            name: h.name,
                            type: "hotel",
                            location: h.address ? `${h.address.city}, ${h.address.country}` : "N/A",
                            rating: h.starRating || 5,
                            reviews: Math.floor(Math.random() * 200) + 10,
                            price: 150,
                            image: h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=450&fit=crop',
                            amenities: h.amenities || ["WiFi", "Pool"],
                            featured: h.isFeatured || false
                        })),
                        ...(villasData.data || []).map((v: any) => ({
                            id: v._id,
                            name: v.propertyName,
                            type: "villa",
                            location: v.address ? `${v.address.city}, ${v.address.country}` : "N/A",
                            rating: 5,
                            reviews: Math.floor(Math.random() * 100) + 5,
                            price: v.propertyDetails?.basePrice || 200,
                            image: v.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=450&fit=crop',
                            amenities: v.indoorAmenities || ["WiFi"],
                            featured: v.isFeatured || false
                        })),
                        ...(aptsData.data || []).map((a: any) => ({
                            id: a._id,
                            name: a.propertyName,
                            type: "apartment",
                            location: a.address ? `${a.address.city}, ${a.address.country}` : "N/A",
                            rating: 4.5,
                            reviews: Math.floor(Math.random() * 80) + 5,
                            price: a.propertyDetails?.basePrice || 100,
                            image: a.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=450&fit=crop',
                            amenities: a.amenities || ["WiFi"],
                            featured: a.isFeatured || false
                        })),
                        ...(resortsData.data || []).map((r: any) => ({
                            id: r._id,
                            name: r.propertyName,
                            type: "resort",
                            location: r.address ? `${r.address.city}, ${r.address.country}` : "N/A",
                            rating: r.starRating || 5,
                            reviews: Math.floor(Math.random() * 300) + 50,
                            price: 250,
                            image: r.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=450&fit=crop',
                            amenities: r.features || ["WiFi", "Pool", "Spa"],
                            featured: r.isFeatured || false
                        }))
                    ];
                }

                setProperties(allProperties);
            } catch (error) {
                console.error("Failed to fetch properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    useEffect(() => {
        const typeParam = searchParams.get("type");
        if (typeParam) {
            setSelectedTypes([typeParam.toLowerCase()]);
        } else {
            setSelectedTypes([]);
        }
    }, [searchParams]);

    const toggleType = (typeId: string) => {
        setSelectedTypes((prev) =>
            prev.includes(typeId)
                ? prev.filter((t) => t !== typeId)
                : [...prev, typeId]
        );
    };

    const filteredProperties = properties.filter((property) => {
        if (selectedTypes.length === 0) return true;
        return property.type && selectedTypes.includes(property.type.toLowerCase());
    });

    return (
        <div className="">
            <div className="py-6 bg-[#EDF2F7]">
                <div className="container">
                    <SearchBar variant="compact" />
                </div>
            </div>

            <div className="container py-8">
                <div className="flex justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">
                            {searchParams.get("checkIn") ? "Available Properties" : "All Properties"}
                        </h3>
                        {searchParams.get("checkIn") && (
                            <p className="text-sm font-medium text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded mt-1">
                                From {searchParams.get("checkIn")} to {searchParams.get("checkOut")} for {searchParams.get("guests")} guests
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                            {filteredProperties.length} properties found
                        </p>
                    </div>
                    <Select>
                        <SelectTrigger className="w-full max-w-48 py-6">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Options</SelectLabel>
                                <SelectItem value="price_low">Price: Low to High</SelectItem>
                                <SelectItem value="price_high">Price: High to Low</SelectItem>
                                <SelectItem value="rating">Top Rated</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex py-4 gap-8">
                    <div className="flex-1 space-y-8">
                        {/* Property Type */}
                        <div>
                            <p className="text-sm font-bold mb-3">Property Type</p>
                            <div>
                                <FieldGroup className="max-w-sm space-y-1">
                                    {propertyTypes.map((type) => (
                                        <Field key={type.id} orientation="horizontal">
                                            <Checkbox
                                                id={type.id}
                                                checked={selectedTypes.includes(type.id)}
                                                onCheckedChange={() => toggleType(type.id)}
                                                className="border-primary mr-2"
                                            />
                                            <Label htmlFor={type.id} className="cursor-pointer">
                                                {type.label}
                                            </Label>
                                        </Field>
                                    ))}
                                </FieldGroup>
                            </div>
                        </div>

                        {/* Price Range  */}
                        <div>
                            <p className="text-sm font-bold mb-3">
                                Price Range
                            </p>
                            <div className="flex gap-4">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    className="focus-visible:ring-primary rounded-sm py-5 "
                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    className="focus-visible:ring-primary rounded-sm py-5"
                                />
                            </div>
                        </div>

                        {/* Amenities  */}
                        <div>
                            <p className="text-sm font-bold mb-3">Amenities</p>

                            <div>
                                <FieldGroup className="max-w-sm space-y-1">
                                    {amenities.map((amenity, index) => (
                                        <Field
                                            key={index}
                                            orientation="horizontal"
                                        >
                                            <Checkbox
                                                id={amenity}
                                                name={amenity}
                                                className="border-primary mr-2"
                                            />
                                            <Label htmlFor={amenity} className="cursor-pointer">
                                                {amenity}
                                            </Label>
                                        </Field>
                                    ))}
                                </FieldGroup>
                            </div>
                        </div>
                    </div>

                    <div className="flex-3">
                        {loading ? (
                            <div className="text-center py-20 text-muted-foreground">
                                Loading properties...
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredProperties.length > 0 ? (
                                    filteredProperties.map((m, index) => (
                                        <HotelCard hotel={m} key={index} />
                                    ))
                                ) : (
                                    <div className="col-span-2 md:col-span-3 text-center py-20 text-muted-foreground border rounded-lg bg-gray-50/50">
                                        No properties match your selected filters.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={<div className="container py-20 text-center">Loading properties...</div>}>
            <PropertiesContent />
        </Suspense>
    );
}
