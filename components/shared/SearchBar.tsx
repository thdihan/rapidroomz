"use client";
import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SearchBar = ({ variant = "hero" }: { variant?: "hero" | "compact" }) => {
    const [destination, setDestination] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState("2");

    const isHero = variant === "hero";

    return (
        <form
            className={`bg-card rounded-lg border border-border shadow-lg ${
                isHero ? "p-4 md:p-6" : "p-3"
            }`}
        >
            <div
                className={`grid gap-3 ${isHero ? "md:grid-cols-[1fr_1fr_1fr_auto_auto]" : "md:grid-cols-[1fr_1fr_1fr_auto_auto]"}`}
            >
                {/* Destination */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Where are you going?"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-10 bg-muted border-0 h-12 focus-visible:ring-blue-500"
                    />
                </div>

                {/* Check-in */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="date"
                        placeholder="Check-in"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="pl-10 bg-muted border-0 h-12 focus-visible:ring-blue-500"
                    />
                </div>

                {/* Check-out */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="date"
                        placeholder="Check-out"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="pl-10 bg-muted border-0 h-12 focus-visible:ring-blue-500"
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
                        className="pl-10 bg-muted border-0 h-12 w-full md:w-24 focus-visible:ring-blue-500"
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="h-12 px-8 bg-accent text-accent-foreground hover:bg-accent-700 font-semibold gap-2 rounded-sm"
                >
                    <Search className="h-4 w-4" />
                    Search
                </Button>
            </div>
        </form>
    );
};

export default SearchBar;
