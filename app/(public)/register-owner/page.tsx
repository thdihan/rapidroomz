"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterOwnerPage() {
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
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password,
                    role: "owner",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Registration failed");
                return;
            }

            toast.success("Owner account created successfully! Please log in.");
            router.push("/login");
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="w-full min-h-[85vh] flex items-center justify-center bg-gray-50/50 py-16 px-4">
            <div className="bg-white w-full max-w-lg p-8 border rounded-lg shadow-sm">
                <div className="text-center mb-8">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full">
                        Partner Registration
                    </span>
                    <h1 className="text-3xl font-bold mt-3 tracking-tight">
                        List Your Property
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Create an owner account to start listing your properties for free.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Full Name</FieldLabel>
                            <Input
                                id="name"
                                name="name"
                                required
                                placeholder="John Doe"
                                className="rounded-sm py-6 focus-visible:ring-primary"
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="email">Email Address</FieldLabel>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="john@example.com"
                                className="rounded-sm py-6 focus-visible:ring-primary"
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
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
                                placeholder="••••••••"
                                className="rounded-sm py-6 focus-visible:ring-primary"
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
                                placeholder="••••••••"
                                className="rounded-sm py-6 focus-visible:ring-primary"
                            />
                        </Field>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="rounded-sm w-full py-6 cursor-pointer hover:bg-primary/85 font-semibold transition-colors"
                            >
                                {isPending ? "Creating Account..." : "Create Owner Account"}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>

                <div className="inset-0 bg-muted my-6 h-[1px]"></div>

                <p className="text-center text-sm text-muted-foreground space-x-2">
                    <span>Already have an account?</span>
                    <Link href="/login" className="text-primary font-medium hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
