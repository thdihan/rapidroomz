"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            setIsPending(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, phone, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Registration failed");
                return;
            }

            toast.success("Account created successfully!");
            router.push("/login");
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center flex-col py-12">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Cancel / Back to Home
            </Link>
            <div className="text-center">
                <Link href="/" className="text-2xl font-bold">
                    <span className="text-[#194B7C]">Rapid</span>
                    <span className="text-[#0168AA]">Roomz</span>
                </Link>
                <h2 className="text-2xl font-semibold mt-2">Create Account</h2>
                <p className="text-sm text-muted-foreground">
                    Start booking your perfect stays
                </p>
            </div>
            <div className="bg-white w-full max-w-md p-6 border rounded-sm mt-4">
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Input
                                id="name"
                                name="name"
                                required
                                placeholder="Jordan Lee"
                                className="rounded-sm py-6 focus-visible:ring-primary"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="name@example.com"
                                className="rounded-sm py-6 focus-visible:ring-primary"
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="phone">Phone</FieldLabel>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                placeholder="+1 (555) 000-0000"
                                className="rounded-sm py-6 focus-visible:ring-primary"
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="********"
                                className="rounded-sm py-6 focus-visible:ring-primary "
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="confirmPassword">
                                Confirm Password
                            </FieldLabel>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                placeholder="********"
                                className="rounded-sm py-6 focus-visible:ring-primary "
                            />
                        </Field>

                        <Field orientation="horizontal" className="pt-2">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="rounded-sm w-full py-6 cursor-pointer hover:bg-primary/85 font-semibold"
                            >
                                {isPending ? "Creating Account..." : "Sign Up"}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>

                <div className="inset-0 bg-muted my-4 h-[1px]"></div>

                <p className="text-center text-sm text-muted-foreground space-x-2">
                    <span>Already have an account?</span>
                    <Link href={"/login"} className="text-primary font-medium">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
