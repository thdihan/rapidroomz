"use client";
import { useState, useEffect } from "react";
import { Search, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useRouter, useSearchParams } from "next/navigation";

type SearchBarProps = {
    variant?: "hero" | "compact";
    onSubmit?: (query: URLSearchParams) => void;
};

const SearchBar = ({ variant = "hero", onSubmit }: SearchBarProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [destination, setDestination] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState("2");

    useEffect(() => {
        if (searchParams) {
            setDestination(searchParams.get("location") || "");
            setCheckIn(searchParams.get("checkIn") || "");
            setCheckOut(searchParams.get("checkOut") || "");
            setGuests(searchParams.get("guests") || "2");
        }
    }, [searchParams]);

    const isHero = variant === "hero";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = new URLSearchParams();
        if (destination) query.append("location", destination);
        if (checkIn) query.append("checkIn", checkIn);
        if (checkOut) query.append("checkOut", checkOut);
        if (guests) query.append("guests", guests);
        
        if (onSubmit) {
            onSubmit(query);
        } else {
            router.push(`/properties?${query.toString()}`);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`bg-card rounded-lg border border-border shadow-lg ${
                isHero ? "p-4 md:p-6" : "p-3"
            }`}
        >
            <div
                className={`grid gap-3 ${isHero ? "md:grid-cols-[1.2fr_1.8fr_auto_auto]" : "md:grid-cols-[1.2fr_1.8fr_auto_auto]"}`}
            >
                {/* Destination */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Where are you going?"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-10 bg-muted border-0 h-12 focus-visible:ring-blue-500 rounded-md"
                    />
                </div>

                {/* Date Range Picker */}
                <div className="w-full">
                    <DateRangePicker
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onSelectRange={(inDate, outDate) => {
                            setCheckIn(inDate);
                            setCheckOut(outDate);
                        }}
                    />
                </div>

                {/* Guests */}
                <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="number"
                        min="1"
                        max="10"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="pl-10 bg-muted border-0 h-12 w-full md:w-24 focus-visible:ring-blue-500 rounded-md"
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="h-12 px-8 bg-accent text-accent-foreground hover:bg-accent-700 cursor-pointer font-semibold gap-2 rounded-md"
                >
                    <Search className="h-4 w-4" />
                    Search
                </Button>
            </div>
        </form>
    );
};

export default SearchBar;
