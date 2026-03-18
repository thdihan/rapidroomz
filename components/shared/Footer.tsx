import { MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-foreground text-primary-foreground ">
            <div className="container py-12 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-lg font-display font-bold mb-4 text-left">
                            RapidRoomz
                        </h3>
                        <p className="text-sm opacity-70 leading-relaxed text-left">
                            Find and book the perfect hotel for your next trip.
                            Best prices guaranteed with instant confirmation.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-80">
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            {["Hotels", "About Us", "Contact", "FAQ"].map(
                                (item) => (
                                    <li key={item}>
                                        <Link
                                            href={`/${item.toLowerCase().replace(/\s/g, "-")}`}
                                            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-80">
                            Support
                        </h4>
                        <ul className="space-y-2">
                            {[
                                "Privacy Policy",
                                "Terms & Conditions",
                                "Cancellation Policy",
                                "Help Center",
                            ].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-80">
                            Contact
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm opacity-70">
                                <MapPin className="h-4 w-4 shrink-0" />
                                123 Booking Street, Travel City
                            </li>
                            <li className="flex items-center gap-2 text-sm opacity-70">
                                <Phone className="h-4 w-4 shrink-0" />
                                +1 (555) 123-4567
                            </li>
                            <li className="flex items-center gap-2 text-sm opacity-70">
                                <Mail className="h-4 w-4 shrink-0" />
                                hello@rapidroomz.com
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center">
                    <p className="text-sm opacity-50">
                        © {new Date().getFullYear()} RapidRoomz. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
