import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { inter } from "@/app/layout";
import { User } from "lucide-react";

type Props = {
    isLoggedIn?: boolean;
};

const Navbar = ({ isLoggedIn = true }: Props) => {
    return (
        <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm flex justify-center">
            <div className="container flex items-center justify-between h-16">
                {/* logo  */}
                <div className={`text-2xl font-bold ${inter.className}`}>
                    <span className="text-[#194B7C]">Rapid</span>
                    <span className="text-[#0168AA]">Roomz</span>
                </div>

                {/* menu  */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link
                        className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                        href="/"
                    >
                        Home
                    </Link>
                    <Link
                        className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                        href="/hotels"
                    >
                        Hotels
                    </Link>
                    <Link
                        className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                        href="/about"
                    >
                        About
                    </Link>
                    <Link
                        className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                        href="/contact"
                    >
                        Contact
                    </Link>
                </nav>

                {/* buttons  */}
                {isLoggedIn && (
                    <div className="space-x-2 flex items-center">
                        <Link href={`/`}>
                            <Button
                                variant="outline"
                                className="rounded-sm py-5 px-4 h-9 cursor-pointer"
                            >
                                <User className="h-4 w-4" />
                                Sign In
                            </Button>
                        </Link>
                        <Link href={`/`}>
                            <Button className="bg-primary rounded-sm py-5 px-4 h-9 hover:bg-primary/90 cursor-pointer">
                                Sign up
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
