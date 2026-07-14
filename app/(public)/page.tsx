import HotelCard from "@/components/hotels/HotelCard";
import Footer from "@/components/shared/Footer";
import SearchBar from "@/components/shared/SearchBar";
import { mockHotels, popularDestinations } from "@/data/mocdata";
import { Shield, Clock, Award, Headphones, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
    {
        icon: Shield,
        title: "Best Price Guarantee",
        desc: "Find a lower price? We'll match it.",
    },
    {
        icon: Clock,
        title: "Instant Confirmation",
        desc: "Get immediate booking confirmation.",
    },
    {
        icon: Award,
        title: "Verified Reviews",
        desc: "Real reviews from real travelers.",
    },
    {
        icon: Headphones,
        title: "24/7 Support",
        desc: "Help whenever you need it.",
    },
];

export default async function Home() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    
    // Fetch all properties
    const [hotelRes, villaRes, aptRes, resortRes] = await Promise.all([
        fetch(`${apiUrl}/hotel`, { next: { revalidate: 0 } }).catch(() => null),
        fetch(`${apiUrl}/villa`, { next: { revalidate: 0 } }).catch(() => null),
        fetch(`${apiUrl}/apartment`, { next: { revalidate: 0 } }).catch(() => null),
        fetch(`${apiUrl}/resort`, { next: { revalidate: 0 } }).catch(() => null),
    ]);

    const hotelsData = hotelRes && hotelRes.ok ? await hotelRes.json() : { data: [] };
    const villasData = villaRes && villaRes.ok ? await villaRes.json() : { data: [] };
    const aptsData = aptRes && aptRes.ok ? await aptRes.json() : { data: [] };
    const resortsData = resortRes && resortRes.ok ? await resortRes.json() : { data: [] };

    const allProperties = [
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

    let featuredProperties = allProperties.filter(p => p.featured === true).slice(0, 8);
    // Fallback to mock data if no properties exist at all (backend empty/offline)
    if (allProperties.length === 0) {
        featuredProperties = mockHotels.filter((m) => m.featured === true);
    }

    return (
        <div>
            {/* hero */}
            <section className="relative bg-primary overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&h=800&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="relative container py-16 md:py-24">
                    <div className="max-w-2xl mb-8 text-left">
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4 text-balance">
                            Find Your Perfect Stay, Instantly
                        </h1>
                        <p className="text-lg text-primary-foreground/80">
                            Discover thousands of hotels worldwide at the best
                            prices. Book with confidence.
                        </p>
                    </div>
                    <SearchBar variant="hero" />
                </div>
            </section>

            {/* info */}
            <section className="container py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {features?.map((f, index) => (
                        <div className="text-center" key={index}>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50  text-primary mb-3">
                                <f.icon className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-sm text-foreground mb-1">
                                {f.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* featured hotel section */}

            <section className="container py-12">
                {/* section header  */}
                <div className="flex justify-between items-center">
                    <div className="text-left">
                        <h2 className="text-2xl font-semibold">
                            Featured Hotels
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Handpicked stays for an unforgettable experience
                        </p>
                    </div>

                    <Link
                        href={`/`}
                        className="text-primary cursor-pointer text-md flex items-center gap-x-1 hover:bg-accent px-4 py-2 rounded-sm hover:text-white"
                    >
                        <span>View all</span> <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Featured Hotels */}
                <div className="py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {featuredProperties.length > 0 ? (
                        featuredProperties.map((m, index) => (
                            <HotelCard hotel={m} key={index} />
                        ))
                    ) : (
                        <div className="col-span-2 md:col-span-4 text-center py-10 text-muted-foreground border rounded-lg bg-gray-50/50">
                            No featured properties available at the moment.
                        </div>
                    )}
                </div>
            </section>

            {/* popular destination  */}
            <section className="container py-12">
                <div className="flex justify-between items-center">
                    <div className="text-left">
                        <h2 className="text-2xl font-semibold">
                            Popular Destinations
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
                    {popularDestinations.map((dest) => (
                        <Link
                            key={dest.name}
                            href={`/hotels?destination=${dest.name}`}
                            className="group"
                        >
                            <div className="relative rounded-lg overflow-hidden aspect-4/3">
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-foreground/70 to-transparent" />
                                <div className="absolute bottom-3 left-3 text-left">
                                    <h3 className="text-sm font-semibold text-primary-foreground">
                                        {dest.name}
                                    </h3>
                                    <p className="text-xs text-primary-foreground/70">
                                        {dest.hotels} hotels
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
