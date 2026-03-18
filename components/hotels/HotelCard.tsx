import { Hotel } from "@/data/mocdata";
import { MapPin, Star } from "lucide-react";

type Props = { hotel: Hotel };

function HotelCard({ hotel }: Props) {
    return (
        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
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
                        <h3 className="text-md mb-1">{hotel.name}</h3>
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

                    <p className="text-xs text-muted-foreground">
                        {hotel.reviews} reviews
                    </p>
                </div>
            </div>
        </div>
    );
}

export default HotelCard;
