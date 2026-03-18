import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { inter } from "../layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function page() {
    return (
        <div className="w-full h-screen flex items-center justify-center flex-col">
            <div className="text-center">
                <div className={`text-2xl font-bold ${inter.className}`}>
                    <span className="text-[#194B7C]">Rapid</span>
                    <span className="text-[#0168AA]">Roomz</span>
                </div>
                <h2 className="text-2xl font-semibold mt-2">Create Account</h2>
                <p className="text-sm text-muted-foreground">
                    Start booking your perfect stays
                </p>
            </div>
            <div className="bg-white w-full max-w-md  p-6 border rounded-sm mt-4">
                <form>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="fieldgroup-name">
                                Name
                            </FieldLabel>
                            <Input
                                id="fieldgroup-name"
                                placeholder="Jordan Lee"
                                className="rounded-sm py-6 focus-visible:ring-primary"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="fieldgroup-email">
                                Email
                            </FieldLabel>
                            <Input
                                id="fieldgroup-email"
                                type="email"
                                placeholder="name@example.com"
                                className="rounded-sm py-6 focus-visible:ring-primary"
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="fieldgroup-password">
                                Password
                            </FieldLabel>
                            <Input
                                id="fieldgroup-password"
                                type="password"
                                placeholder="********"
                                className="rounded-sm py-6 focus-visible:ring-primary "
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="fieldgroup-password">
                                Confirm Password
                            </FieldLabel>
                            <Input
                                id="fieldgroup-password"
                                type="password"
                                placeholder="********"
                                className="rounded-sm py-6 focus-visible:ring-primary "
                            />
                        </Field>

                        <Field orientation="horizontal">
                            <Button
                                type="submit"
                                className="rounded-sm w-full py-6 cursor-pointer hover:bg-primary/85 font-semibold"
                            >
                                Sign In
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>

                <div className="inset-0 bg-muted my-4 h-1"></div>

                <p className="text-center text-sm text-muted-foreground space-x-2">
                    <span>Already have an account?</span>
                    <Link href={"/login"} className="text-primary">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default page;
