import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { auth } from "@/auth";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    return (
        <div>
            <Navbar user={session?.user} />
            {children}
            <Footer />
        </div>
    );
}
