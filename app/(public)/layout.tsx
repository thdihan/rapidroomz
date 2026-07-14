import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { auth } from "@/auth";
import NextAuthProvider from "@/components/shared/NextAuthProvider";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    return (
        <NextAuthProvider>
            <div>
                <Navbar user={session?.user} />
                {children}
                <Footer />
            </div>
        </NextAuthProvider>
    );
}
