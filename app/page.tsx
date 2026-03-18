import SearchBar from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div>
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
        </div>
    );
}
