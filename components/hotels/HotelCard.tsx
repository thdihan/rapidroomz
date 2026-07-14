"use client";

import { Hotel } from "@/data/mocdata";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Props = { hotel: Hotel };

function HotelCard({ hotel }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const type = hotel.type || "hotel";
    let detailUrl = `/properties/${hotel.id}?type=${type}`;
    
    if (searchParams) {
        const checkIn = searchParams.get("checkIn");
        const checkOut = searchParams.get("checkOut");
        const guests = searchParams.get("guests");
        const location = searchParams.get("location");
        
        if (checkIn) detailUrl += `&checkIn=${checkIn}`;
        if (checkOut) detailUrl += `&checkOut=${checkOut}`;
        if (guests) detailUrl += `&guests=${guests}`;
        if (location) detailUrl += `&location=${location}`;
    }

    return (
        <div 
            onClick={() => router.push(detailUrl)}
            className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
        >
            <div className="relative">
                <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <p className="py-1 px-2 bg-accent absolute top-4 left-4 text-xs rounded-full text-white font-semibold">
                    Featured
                </p>
            </div>

            <div className="text-left p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-md mb-1 hover:text-primary transition-colors">
                            <Link href={detailUrl} onClick={(e) => e.stopPropagation()}>
                                {hotel.name}
                            </Link>
                        </h3>
                        <p className="text-muted-foreground text-sm flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />{" "}
                            <span>{hotel.location}</span>
                        </p>
                    </div>
                    <p className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-accent" />{" "}
                        <span className="text-sm">3.4</span>
                    </p>
                </div>
                <div className="flex space-x-1.5 py-2">
                    {hotel.amenities.map((am, index) => (
                        <span
                            key={index}
                            className="text-xs  bg-muted px-2 py-1 rounded-sm"
                        >
                            {am}
                        </span>
                    ))}
                </div>

                <div className="border"></div>

                <div className="pt-4 flex justify-between items-end ">
                    <div>
                        <p className="text-xs text-muted-foreground">From</p>

                        <p>
                            <span className="text-lg text-primary font-bold">
                                ${hotel.price}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                /night
                            </span>
                        </p>
                    </div>

                    <div className="text-right">
                        {(hotel as any).availableCapacity !== undefined && (
                            <p className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-sm mb-1 inline-block">
                                Max {(hotel as any).availableCapacity} guests
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {hotel.reviews} reviews
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HotelCard;
