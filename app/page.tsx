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

export default function Home() {
    return (
        <div className="bg-[#F9FAFB]">
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
                    {mockHotels
                        ?.filter((m) => m.featured === true)
                        .map((m, index) => (
                            <HotelCard hotel={m} key={index} />
                        ))}
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

            <Footer />
        </div>
    );
}
