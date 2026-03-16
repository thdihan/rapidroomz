"use client";

import { useState } from "react";
import { signup } from "@/services/signup.service";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function Page() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "admin",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await signup(form);
            setMessage(res?.message || "Signup successful");
        } catch (error: any) {
            setMessage(error.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm({ name: "", email: "", password: "", phone: "", role: "user" });
        setMessage("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="fieldgroup-name">Name</FieldLabel>
                    <Input
                        id="fieldgroup-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name..."
                        required
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
                    <Input
                        id="fieldgroup-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        required
                    />
                    <FieldDescription>
                        We&apos;ll send updates to this address.
                    </FieldDescription>
                </Field>

                <Field>
                    <FieldLabel htmlFor="fieldgroup-password">
                        Password
                    </FieldLabel>
                    <Input
                        id="fieldgroup-password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="********"
                        required
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="fieldgroup-phone">Phone</FieldLabel>
                    <Input
                        id="fieldgroup-phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="********"
                        required
                    />
                </Field>

                {message ? <p className="text-sm">{message}</p> : null}

                <Field orientation="horizontal">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                    >
                        Reset
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
// ...existing code...
