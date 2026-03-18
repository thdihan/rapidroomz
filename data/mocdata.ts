export interface Hotel {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    price: number;
    image: string;
    amenities: string[];
    featured?: boolean;
}

export const mockHotels: Hotel[] = [
    {
        id: "1",
        name: "The Grand Horizon Resort",
        location: "Maldives",
        rating: 4.9,
        reviews: 342,
        price: 289,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=450&fit=crop",
        amenities: ["Pool", "Spa", "Beach", "WiFi"],
        featured: true,
    },
    {
        id: "2",
        name: "Urban Luxe Hotel",
        location: "New York, USA",
        rating: 4.7,
        reviews: 521,
        price: 199,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=450&fit=crop",
        amenities: ["Gym", "Restaurant", "WiFi", "Bar"],
        featured: true,
    },
    {
        id: "3",
        name: "Sakura Garden Inn",
        location: "Tokyo, Japan",
        rating: 4.8,
        reviews: 198,
        price: 175,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=450&fit=crop",
        amenities: ["Garden", "WiFi", "Breakfast", "Onsen"],
        featured: true,
    },
    {
        id: "4",
        name: "Alpine Retreat Lodge",
        location: "Swiss Alps",
        rating: 4.6,
        reviews: 156,
        price: 320,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=450&fit=crop",
        amenities: ["Ski", "Fireplace", "Spa", "WiFi"],
    },
    {
        id: "5",
        name: "Oceanview Paradise",
        location: "Bali, Indonesia",
        rating: 4.8,
        reviews: 412,
        price: 145,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=450&fit=crop",
        amenities: ["Pool", "Beach", "WiFi", "Yoga"],
    },
    {
        id: "6",
        name: "Parisian Boutique Hotel",
        location: "Paris, France",
        rating: 4.5,
        reviews: 289,
        price: 230,
        image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&h=450&fit=crop",
        amenities: ["Restaurant", "WiFi", "Bar", "Terrace"],
    },
    {
        id: "7",
        name: "Desert Oasis Resort",
        location: "Dubai, UAE",
        rating: 4.9,
        reviews: 567,
        price: 450,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=450&fit=crop",
        amenities: ["Pool", "Spa", "Restaurant", "WiFi"],
        featured: true,
    },
    {
        id: "8",
        name: "Coastal Breeze Inn",
        location: "Santorini, Greece",
        rating: 4.7,
        reviews: 234,
        price: 195,
        image: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600&h=450&fit=crop",
        amenities: ["Pool", "View", "WiFi", "Breakfast"],
    },
];

export const popularDestinations = [
    {
        name: "Maldives",
        hotels: 124,
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop",
    },
    {
        name: "Paris",
        hotels: 892,
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop",
    },
    {
        name: "Tokyo",
        hotels: 654,
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    },
    {
        name: "Bali",
        hotels: 438,
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop",
    },
    {
        name: "New York",
        hotels: 1205,
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop",
    },
    {
        name: "Dubai",
        hotels: 567,
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
    },
];

export const mockRooms = [
    {
        id: "r1",
        name: "Deluxe Ocean View",
        bedType: "King Bed",
        capacity: 2,
        price: 289,
        amenities: [
            "Ocean View",
            "Balcony",
            "Mini Bar",
            "WiFi",
            "Room Service",
        ],
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop",
        available: true,
    },
    {
        id: "r2",
        name: "Premium Suite",
        bedType: "King Bed + Sofa",
        capacity: 3,
        price: 459,
        amenities: [
            "Ocean View",
            "Living Room",
            "Jacuzzi",
            "WiFi",
            "Butler Service",
        ],
        image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&h=400&fit=crop",
        available: true,
    },
    {
        id: "r3",
        name: "Standard Room",
        bedType: "Queen Bed",
        capacity: 2,
        price: 189,
        amenities: ["Garden View", "WiFi", "Air Conditioning", "Safe"],
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
        available: true,
    },
    {
        id: "r4",
        name: "Family Suite",
        bedType: "2 Queen Beds",
        capacity: 4,
        price: 389,
        amenities: ["Pool View", "Living Area", "WiFi", "Kid-friendly"],
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=400&fit=crop",
        available: false,
    },
];

export const mockReviews = [
    {
        id: "rv1",
        name: "Sarah M.",
        rating: 5,
        date: "2 weeks ago",
        comment:
            "Absolutely stunning resort! The service was impeccable and the views were breathtaking.",
    },
    {
        id: "rv2",
        name: "James K.",
        rating: 4,
        date: "1 month ago",
        comment:
            "Great location and beautiful rooms. Restaurant could have more variety.",
    },
    {
        id: "rv3",
        name: "Emily R.",
        rating: 5,
        date: "1 month ago",
        comment:
            "Perfect honeymoon destination. The staff went above and beyond to make our stay special.",
    },
    {
        id: "rv4",
        name: "Michael T.",
        rating: 4,
        date: "2 months ago",
        comment:
            "Excellent facilities and very clean. Would definitely come back.",
    },
];
