"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                toast.error("Invalid email or password");
                setIsPending(false);
                return;
            }

            toast.success("Welcome back!");
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred.");
            setIsPending(false);
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-center flex-col">
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
                <h2 className="text-2xl font-semibold mt-2">Welcome Back!</h2>
                <p className="text-sm text-muted-foreground">
                    Sign in to your account
                </p>
            </div>
            <div className="bg-white w-full max-w-md p-6 border rounded-sm mt-4">
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
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
                            <FieldLabel
                                htmlFor="password"
                                className="flex justify-between"
                            >
                                <span>Password</span>{" "}
                                <Link
                                    href={`/`}
                                    className="text-xs text-primary"
                                >
                                    Forgot password?
                                </Link>
                            </FieldLabel>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="******"
                                className="rounded-sm py-6 focus-visible:ring-primary"
                            />
                        </Field>
                        <Field orientation="horizontal" className="pt-2">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="rounded-sm w-full py-6 cursor-pointer hover:bg-primary/85 font-semibold"
                            >
                                {isPending ? "Signing In..." : "Sign In"}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>

                <div className="inset-0 bg-muted my-4 h-[1px]"></div>

                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href={`/signup`} className="text-primary font-medium">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
