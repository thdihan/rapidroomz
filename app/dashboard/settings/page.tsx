"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDashboardRole } from "@/components/dashboard/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Settings, FileText, Save, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const { role } = useDashboardRole();
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [aboutText, setAboutText] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
        if (!isDemoMode) {
            if (status === "unauthenticated") {
                router.push("/login");
            } else if (status === "authenticated") {
                const sessionRole = (session?.user as any)?.role;
                if (sessionRole !== "admin") {
                    router.push("/dashboard");
                    toast.error("Unauthorized access.");
                    return;
                }
                fetchSettings();
            }
        } else {
            if (role !== "admin") {
                router.push("/dashboard");
                toast.error("Unauthorized access.");
                return;
            }
            fetchSettings();
        }
    }, [status, session, role, router]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/setting/about_us`);
            const result = await response.json();
            if (result.success && result.data) {
                setAboutText(result.data.value || "");
            } else {
                toast.error("Failed to fetch settings from DB.");
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Could not reach settings server.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aboutText.trim()) {
            toast.error("About Us text cannot be empty.");
            return;
        }

        try {
            setSaving(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/setting/about_us`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ value: aboutText }),
            });
            const result = await response.json();
            if (result.success) {
                toast.success("About Us settings saved successfully!");
            } else {
                toast.error(result.message || "Failed to update settings.");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Could not save settings to server.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spinner className="w-8 h-8 text-[#1b5cac]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in text-left">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-[#1b5cac]" />
                    Platform Settings
                </h1>
                <p className="text-gray-500 mt-1">Configure static page content, system properties, and CMS settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border-gray-100 bg-white">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center gap-3">
                            <div className="p-2 bg-blue-50 text-[#1b5cac] rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-gray-800">About Us Page Content</CardTitle>
                                <CardDescription>Customize the text rendered on the public About Us route.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="about_us_text" className="text-sm font-bold text-gray-700">
                                        About Us Content Text
                                    </Label>
                                    <Textarea
                                        id="about_us_text"
                                        value={aboutText}
                                        onChange={(e) => setAboutText(e.target.value)}
                                        placeholder="Describe the company mission, values, and platform details..."
                                        rows={12}
                                        className="font-medium text-slate-800 text-sm leading-relaxed border-gray-200 focus-visible:ring-[#1b5cac] focus-visible:border-[#1b5cac] rounded-lg shadow-inner py-3 min-h-[300px]"
                                    />
                                    <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                                        <span className="font-semibold">Supports plain text or Markdown style spacing.</span>
                                        <span className="font-bold">{aboutText.length} characters</span>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-[#1b5cac] hover:bg-[#1b5cac]/90 px-6 py-5 font-bold shadow-sm shadow-[#1b5cac]/10 text-white rounded-lg flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                                    >
                                        {saving ? (
                                            <Spinner className="w-4 h-4 text-white" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {saving ? "Saving Changes..." : "Save Settings"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Tip Area */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-blue-100 bg-[#f2f7fd]/30">
                        <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
                            <Info className="w-5 h-5 text-[#1b5cac]" />
                            <CardTitle className="text-sm font-bold text-gray-800">Content Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-600 space-y-3 leading-relaxed">
                            <p>
                                The About Us text is displayed prominently on the public homepage sidebar, about page templates, and footer briefs.
                            </p>
                            <p className="font-semibold text-[#1b5cac]">
                                ✔ Clear and concise statements on brand objectives.
                            </p>
                            <p className="font-semibold text-[#1b5cac]">
                                ✔ Professional tone aligned with global booking directories.
                            </p>
                            <p className="font-semibold text-[#1b5cac]">
                                ✔ Regular updates to reflect new properties, regions, or services.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-amber-100 bg-amber-50/10">
                        <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
                            <AlertTriangle className="w-5 h-5 text-[#f5a124]" />
                            <CardTitle className="text-sm font-bold text-gray-800">System Warning</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-600 leading-relaxed">
                            <p>
                                Modifying these platform settings changes production database properties directly. Ensure that content is proofread before committing changes.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
