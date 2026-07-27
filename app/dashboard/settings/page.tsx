"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboardRole } from "@/components/dashboard/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Settings, FileText, Save, Info, AlertTriangle, Phone, Mail, MapPin, Clock, Globe, MessageSquare, CheckCircle, Trash2, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: "unread" | "read" | "replied";
    createdAt: string;
}

interface ContactInfoState {
    email: string;
    phone: string;
    address: string;
    workingHours: string;
    mapUrl: string;
}

function SettingsContent() {
    const { role } = useDashboardRole();
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentTab = searchParams.get("tab") || "about";
    const [activeTab, setActiveTab] = useState(currentTab);

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Handle tab change and update URL query param
    const handleTabChange = (val: string) => {
        setActiveTab(val);
        router.push(`/dashboard/settings?tab=${val}`);
    };

    // About Us State
    const [aboutText, setAboutText] = useState("");
    const [loadingAbout, setLoadingAbout] = useState(true);
    const [savingAbout, setSavingAbout] = useState(false);

    // Contact Info State
    const [contactInfo, setContactInfo] = useState<ContactInfoState>({
        email: "hello@rapidroomz.com",
        phone: "+1 (555) 123-4567",
        address: "123 Booking Street, Travel City, NY 10001",
        workingHours: "Monday - Friday: 9:00 AM - 6:00 PM EST",
        mapUrl: "",
    });
    const [loadingContactInfo, setLoadingContactInfo] = useState(true);
    const [savingContactInfo, setSavingContactInfo] = useState(false);

    // Customer Messages State
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    // Amenities State
    const [amenities, setAmenities] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loadingAmenities, setLoadingAmenities] = useState(true);
    const [savingAmenity, setSavingAmenity] = useState(false);

    // New Amenity Form State
    const [newAmenityLabel, setNewAmenityLabel] = useState("");
    const [newAmenityPropertyTypes, setNewAmenityPropertyTypes] = useState<string[]>(["hotel"]);
    const [newAmenityCategory, setNewAmenityCategory] = useState<"indoor" | "outdoor" | "service" | "general">("general");

    // Suggestion Approval Modal State
    const [approvingSuggestion, setApprovingSuggestion] = useState<any | null>(null);
    const [approvePropertyTypes, setApprovePropertyTypes] = useState<string[]>([]);
    const [approveCategory, setApproveCategory] = useState<"indoor" | "outdoor" | "service" | "general">("general");

    const fetchAmenities = async () => {
        try {
            setLoadingAmenities(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            
            const resDefaults = await fetch(`${apiUrl}/amenity?isSuggested=false`);
            const dataDefaults = await resDefaults.json();
            if (dataDefaults.success && Array.isArray(dataDefaults.data)) {
                setAmenities(dataDefaults.data);
            }

            const resSuggestions = await fetch(`${apiUrl}/amenity?isSuggested=true`);
            const dataSuggestions = await resSuggestions.json();
            if (dataSuggestions.success && Array.isArray(dataSuggestions.data)) {
                setSuggestions(dataSuggestions.data);
            }
        } catch (error) {
            console.error("Error fetching amenities:", error);
        } finally {
            setLoadingAmenities(false);
        }
    };

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
                fetchMessages();
                fetchAmenities();
            }
        } else {
            if (role !== "admin") {
                router.push("/dashboard");
                toast.error("Unauthorized access.");
                return;
            }
            fetchSettings();
            fetchMessages();
            fetchAmenities();
        }
    }, [status, session, role, router]);

    const fetchSettings = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        
        // Fetch About Us
        try {
            setLoadingAbout(true);
            const response = await fetch(`${apiUrl}/setting/about_us`);
            const result = await response.json();
            if (result.success && result.data) {
                setAboutText(result.data.value || "");
            }
        } catch (error) {
            console.error("Error fetching About Us:", error);
        } finally {
            setLoadingAbout(false);
        }

        // Fetch Contact Info
        try {
            setLoadingContactInfo(true);
            const response = await fetch(`${apiUrl}/setting/contact_info`);
            const result = await response.json();
            if (result.success && result.data?.value) {
                try {
                    const parsed = JSON.parse(result.data.value);
                    setContactInfo((prev) => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Failed to parse contact info setting", e);
                }
            }
        } catch (error) {
            console.error("Error fetching Contact Info setting:", error);
        } finally {
            setLoadingContactInfo(false);
        }
    };

    const fetchMessages = async () => {
        try {
            setLoadingMessages(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/contact`);
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setMessages(result.data);
            }
        } catch (error) {
            console.error("Error fetching contact messages:", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSaveAbout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aboutText.trim()) {
            toast.error("About Us text cannot be empty.");
            return;
        }

        try {
            setSavingAbout(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/setting/about_us`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: aboutText }),
            });
            const result = await response.json();
            if (result.success) {
                toast.success("About Us settings saved successfully!");
            } else {
                toast.error(result.message || "Failed to update settings.");
            }
        } catch (error) {
            console.error("Error saving About Us:", error);
            toast.error("Could not save settings to server.");
        } finally {
            setSavingAbout(false);
        }
    };

    const handleSaveContactInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSavingContactInfo(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/setting/contact_info`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: JSON.stringify(contactInfo) }),
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Contact information saved successfully!");
            } else {
                toast.error(result.message || "Failed to update contact info.");
            }
        } catch (error) {
            console.error("Error saving contact info:", error);
            toast.error("Could not save contact info to server.");
        } finally {
            setSavingContactInfo(false);
        }
    };

    const handleUpdateMessageStatus = async (id: string, status: "unread" | "read" | "replied") => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/contact/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const result = await response.json();
            if (result.success) {
                setMessages((prev) =>
                    prev.map((m) => (m._id === id ? { ...m, status } : m))
                );
                if (selectedMessage && selectedMessage._id === id) {
                    setSelectedMessage({ ...selectedMessage, status });
                }
                toast.success(`Message status updated to '${status}'`);
            } else {
                toast.error(result.message || "Failed to update status.");
            }
        } catch (error) {
            console.error("Error updating message status:", error);
            toast.error("Could not update status.");
        }
    };

    const handleAddAmenity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAmenityLabel.trim() || newAmenityPropertyTypes.length === 0) return;
        try {
            setSavingAmenity(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/amenity/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: newAmenityLabel.trim(),
                    propertyTypes: newAmenityPropertyTypes,
                    category: newAmenityCategory,
                    isSuggested: false
                })
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Default amenity added successfully!");
                setNewAmenityLabel("");
                setNewAmenityPropertyTypes(["hotel"]);
                fetchAmenities();
            } else {
                toast.error(result.message || "Failed to add amenity.");
            }
        } catch (err) {
            console.error("Error adding amenity:", err);
            toast.error("Could not add amenity.");
        } finally {
            setSavingAmenity(false);
        }
    };

    const handleApproveSuggestion = (sug: any) => {
        setApprovingSuggestion(sug);
        setApprovePropertyTypes(sug.propertyTypes || (sug.propertyType ? [sug.propertyType] : ["hotel"]));
        setApproveCategory(sug.category || "general");
    };

    const handleConfirmApproveSuggestion = async () => {
        if (!approvingSuggestion) return;
        if (approvePropertyTypes.length === 0) {
            toast.error("Please select at least one property type.");
            return;
        }
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/amenity/${approvingSuggestion._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyTypes: approvePropertyTypes,
                    category: approveCategory,
                    isSuggested: false
                })
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Suggested amenity approved!");
                setApprovingSuggestion(null);
                fetchAmenities();
            } else {
                toast.error(result.message || "Failed to approve amenity.");
            }
        } catch (err) {
            console.error("Error approving suggestion:", err);
            toast.error("Could not approve suggestion.");
        }
    };

    const handleIgnoreAmenity = async (id: string) => {
        if (!confirm("Are you sure you want to ignore/delete this amenity?")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/amenity/${id}`, {
                method: "DELETE"
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Amenity deleted/ignored successfully.");
                fetchAmenities();
            } else {
                toast.error(result.message || "Failed to delete amenity.");
            }
        } catch (err) {
            console.error("Error deleting amenity:", err);
            toast.error("Could not delete amenity.");
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (!confirm("Are you sure you want to delete this customer inquiry?")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/contact/${id}`, {
                method: "DELETE",
            });
            const result = await response.json();
            if (result.success) {
                setMessages((prev) => prev.filter((m) => m._id !== id));
                if (selectedMessage && selectedMessage._id === id) {
                    setSelectedMessage(null);
                }
                toast.success("Inquiry deleted successfully!");
            } else {
                toast.error(result.message || "Failed to delete inquiry.");
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Could not delete message.");
        }
    };

    if (status === "loading" || (loadingAbout && loadingContactInfo)) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spinner className="w-8 h-8 text-[#1b5cac]" />
            </div>
        );
    }

    const unreadCount = messages.filter((m) => m.status === "unread").length;

    return (
        <div className="space-y-8 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-[#1b5cac]" />
                        Platform Settings & Administration
                    </h1>
                    <p className="text-gray-500 mt-1">Configure site content, contact info settings, and manage customer inquiries.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl gap-1">
                    <TabsTrigger value="about" className="font-bold text-xs sm:text-sm gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1b5cac]">
                        <FileText className="size-4" />
                        About Us Content
                    </TabsTrigger>
                    <TabsTrigger value="contact_info" className="font-bold text-xs sm:text-sm gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1b5cac]">
                        <Phone className="size-4" />
                        Contact Info Settings
                    </TabsTrigger>
                    <TabsTrigger value="amenities" className="font-bold text-xs sm:text-sm gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1b5cac]">
                        <CheckCircle className="size-4" />
                        Default Amenities
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: About Us Content */}
                <TabsContent value="about" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-sm border-gray-200 bg-white">
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
                                    <form onSubmit={handleSaveAbout} className="space-y-6">
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
                                                disabled={savingAbout}
                                                className="bg-[#1b5cac] hover:bg-[#1b5cac]/90 px-6 py-5 font-bold shadow-sm shadow-[#1b5cac]/10 text-white rounded-lg flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                                            >
                                                {savingAbout ? (
                                                    <Spinner className="w-4 h-4 text-white" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                {savingAbout ? "Saving Changes..." : "Save About Us"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="shadow-sm border-blue-100 bg-[#f2f7fd]/30">
                                <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
                                    <Info className="w-5 h-5 text-[#1b5cac]" />
                                    <CardTitle className="text-sm font-bold text-gray-800">Content Guidelines</CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-slate-600 space-y-3 leading-relaxed">
                                    <p>The About Us text is displayed prominently on the public route and about page templates.</p>
                                    <p className="font-semibold text-[#1b5cac]">✔ Clear and concise statements on brand objectives.</p>
                                    <p className="font-semibold text-[#1b5cac]">✔ Professional tone aligned with global booking directories.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Tab 2: Contact Info Settings */}
                <TabsContent value="contact_info" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-sm border-gray-200 bg-white">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-gray-800">Contact Information Section</CardTitle>
                                        <CardDescription>Configure contact details rendered on the public Contact Us page.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <form onSubmit={handleSaveContactInfo} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact_email" className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                                    <Mail className="size-3.5 text-[#1b5cac]" /> Contact Email
                                                </Label>
                                                <Input
                                                    id="contact_email"
                                                    type="email"
                                                    value={contactInfo.email}
                                                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                                    placeholder="hello@rapidroomz.com"
                                                    className="h-10 border-gray-200 focus-visible:ring-[#1b5cac]"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="contact_phone" className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                                    <Phone className="size-3.5 text-emerald-600" /> Phone Number
                                                </Label>
                                                <Input
                                                    id="contact_phone"
                                                    value={contactInfo.phone}
                                                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                                    placeholder="+1 (555) 123-4567"
                                                    className="h-10 border-gray-200 focus-visible:ring-[#1b5cac]"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact_address" className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                                <MapPin className="size-3.5 text-red-500" /> Headquarters Address
                                            </Label>
                                            <Input
                                                id="contact_address"
                                                value={contactInfo.address}
                                                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                                                placeholder="123 Booking Street, Travel City, NY 10001"
                                                className="h-10 border-gray-200 focus-visible:ring-[#1b5cac]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact_hours" className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                                <Clock className="size-3.5 text-amber-500" /> Working Hours
                                            </Label>
                                            <Input
                                                id="contact_hours"
                                                value={contactInfo.workingHours}
                                                onChange={(e) => setContactInfo({ ...contactInfo, workingHours: e.target.value })}
                                                placeholder="Monday - Friday: 9:00 AM - 6:00 PM EST"
                                                className="h-10 border-gray-200 focus-visible:ring-[#1b5cac]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact_map" className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                                <Globe className="size-3.5 text-blue-500" /> Google Maps Embed URL
                                            </Label>
                                            <Input
                                                id="contact_map"
                                                value={contactInfo.mapUrl}
                                                onChange={(e) => setContactInfo({ ...contactInfo, mapUrl: e.target.value })}
                                                placeholder="https://www.google.com/maps/embed?..."
                                                className="h-10 border-gray-200 focus-visible:ring-[#1b5cac]"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-3">
                                            <Button
                                                type="submit"
                                                disabled={savingContactInfo}
                                                className="bg-[#1b5cac] hover:bg-[#1b5cac]/90 px-6 py-5 font-bold shadow-sm shadow-[#1b5cac]/10 text-white rounded-lg flex items-center gap-2 cursor-pointer"
                                            >
                                                {savingContactInfo ? (
                                                    <Spinner className="w-4 h-4 text-white" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                {savingContactInfo ? "Saving..." : "Save Contact Info"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="shadow-sm border-indigo-100 bg-indigo-50/20">
                                <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
                                    <Info className="w-5 h-5 text-indigo-600" />
                                    <CardTitle className="text-sm font-bold text-gray-800">Public Placement</CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-slate-600 space-y-3 leading-relaxed">
                                    <p>These contact values will automatically populate on:</p>
                                    <p className="font-semibold text-indigo-700">✔ Public Contact Us page (`/contact` & `/contact-us`)</p>
                                    <p className="font-semibold text-indigo-700">✔ Embedded interactive location map frame</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Tab 4: Default Amenities */}
                <TabsContent value="amenities" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Column */}
                        <div className="space-y-6">
                            <Card className="shadow-sm border-gray-200 bg-white">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-[#1b5cac] rounded-lg">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-gray-800 font-bold">Add Amenity</CardTitle>
                                        <CardDescription>Create a new default amenity for forms.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <form onSubmit={handleAddAmenity} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="amenity_label" className="text-sm font-bold text-gray-700">Display Name</Label>
                                            <Input
                                                id="amenity_label"
                                                placeholder="e.g. Free Breakfast, Indoor Pool"
                                                value={newAmenityLabel}
                                                onChange={(e) => setNewAmenityLabel(e.target.value)}
                                                required
                                                className="h-10"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-bold text-gray-700">Property Types</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                {[
                                                    { id: "hotel", label: "Hotel" },
                                                    { id: "villa", label: "Villa" },
                                                    { id: "apartment", label: "Apartment" },
                                                    { id: "resort", label: "Resort" },
                                                    { id: "all", label: "All Properties" }
                                                ].map((item) => (
                                                    <label key={item.id} className="flex items-center space-x-2 border rounded p-2 hover:bg-slate-50 cursor-pointer text-xs">
                                                        <input
                                                            type="checkbox"
                                                            checked={newAmenityPropertyTypes.includes(item.id)}
                                                            onChange={(e) => {
                                                                if (item.id === "all") {
                                                                    if (e.target.checked) {
                                                                        setNewAmenityPropertyTypes(["all"]);
                                                                    } else {
                                                                        setNewAmenityPropertyTypes([]);
                                                                    }
                                                                } else {
                                                                    let updated = [...newAmenityPropertyTypes].filter(x => x !== "all");
                                                                    if (e.target.checked) {
                                                                        updated.push(item.id);
                                                                    } else {
                                                                        updated = updated.filter(x => x !== item.id);
                                                                    }
                                                                    setNewAmenityPropertyTypes(updated);
                                                                }
                                                            }}
                                                            className="rounded text-[#1b5cac] focus:ring-[#1b5cac] size-3.5"
                                                        />
                                                        <span>{item.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="amenity_category" className="text-sm font-bold text-gray-700">Category</Label>
                                            <select
                                                id="amenity_category"
                                                value={newAmenityCategory}
                                                onChange={(e) => setNewAmenityCategory(e.target.value as any)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="general">General</option>
                                                <option value="indoor">Indoor</option>
                                                <option value="outdoor">Outdoor</option>
                                                <option value="service">Service</option>
                                            </select>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={savingAmenity || !newAmenityLabel.trim()}
                                            className="w-full bg-[#1b5cac] hover:bg-[#1b5cac]/90 text-white font-bold h-10"
                                        >
                                            {savingAmenity ? <Spinner className="size-4 mr-2" /> : <Save className="size-4 mr-2" />}
                                            Add Amenity
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Suggestions List */}
                            <Card className="shadow-sm border-amber-200 bg-amber-50/10">
                                <CardHeader className="bg-amber-50/30 border-b border-amber-100 flex flex-row items-center gap-3">
                                    <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                                        <Info className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-amber-900 font-bold">Suggested Amenities</CardTitle>
                                        <CardDescription className="text-amber-800 text-xs">Pending review from user properties.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {loadingAmenities ? (
                                        <div className="flex justify-center py-4"><Spinner className="size-5 text-amber-600" /></div>
                                    ) : suggestions.length === 0 ? (
                                        <div className="text-center py-6 text-slate-500 text-sm">
                                            No pending custom suggestions.
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                                            {suggestions.map((sug) => (
                                                <div key={sug._id} className="p-4 bg-white border border-amber-100 rounded-lg shadow-sm space-y-3">
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">{sug.label}</div>
                                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                            {sug.propertyTypes ? (
                                                                sug.propertyTypes.map((pt: string) => (
                                                                    <Badge key={pt} className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 text-[10px] capitalize px-2 py-0">
                                                                        {pt}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 text-[10px] capitalize px-2 py-0">
                                                                    {sug.propertyType}
                                                                </Badge>
                                                            )}
                                                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border border-slate-200 text-[10px] capitalize px-2 py-0">
                                                                {sug.category}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 justify-end pt-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 h-8"
                                                            onClick={() => handleApproveSuggestion(sug)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100 h-8"
                                                            onClick={() => handleIgnoreAmenity(sug._id)}
                                                        >
                                                            Ignore
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                     )}
                                </CardContent>
                            </Card>
                        </div>
 
                        {/* List Column */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-sm border-gray-200 bg-white h-full">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg text-gray-800 font-bold">Global Default List</CardTitle>
                                            <CardDescription>View existing default amenities grouped by Property Type.</CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={fetchAmenities}
                                        className="gap-1.5 text-xs font-bold"
                                    >
                                        <RefreshCw className="size-3.5" /> Refresh List
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {loadingAmenities ? (
                                        <div className="flex justify-center items-center py-20">
                                            <Spinner className="size-8 text-[#1b5cac]" />
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {["hotel", "villa", "apartment", "resort", "all"].map((pType) => {
                                                const filtered = amenities.filter((a) => (a.propertyTypes && a.propertyTypes.includes(pType)) || a.propertyType === pType);
                                                if (filtered.length === 0) return null;
                                                return (
                                                    <div key={pType} className="space-y-3">
                                                        <h3 className="text-sm font-bold text-gray-900 border-b pb-1.5 flex justify-between items-center capitalize">
                                                            <span>{pType === 'all' ? 'All Properties' : `${pType}s`}</span>
                                                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                                                {filtered.length}
                                                            </span>
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {filtered.map((amenity) => (
                                                                <div
                                                                    key={amenity._id}
                                                                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 hover:border-red-200 hover:bg-red-50/30 group transition-all"
                                                                >
                                                                    <span>{amenity.label}</span>
                                                                    <span className="text-[10px] text-slate-400 capitalize bg-slate-200/50 px-1.5 py-0.2 rounded font-normal">
                                                                        {amenity.category}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleIgnoreAmenity(amenity._id)}
                                                                        className="text-slate-400 hover:text-red-600 group-hover:text-red-500 p-0.5 rounded-full transition-colors ml-0.5"
                                                                    >
                                                                        <Trash2 className="size-3.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Tab 3: Customer Queries */}
                <TabsContent value="queries" className="space-y-6">
                    <Card className="shadow-sm border-gray-200 bg-white">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-gray-800">Customer Inquiries & Messages</CardTitle>
                                    <CardDescription>View and manage contact form submissions sent by users.</CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchMessages}
                                className="gap-1.5 text-xs font-bold"
                            >
                                <RefreshCw className="size-3.5" /> Refresh
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center p-12">
                                    <Spinner className="size-6 text-[#1b5cac]" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="p-12 text-center text-slate-500 space-y-2">
                                    <MessageSquare className="size-10 mx-auto text-slate-300" />
                                    <p className="font-medium text-sm">No customer inquiries submitted yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead className="font-bold text-xs">Date</TableHead>
                                                <TableHead className="font-bold text-xs">Sender</TableHead>
                                                <TableHead className="font-bold text-xs">Subject</TableHead>
                                                <TableHead className="font-bold text-xs">Status</TableHead>
                                                <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {messages.map((msg) => (
                                                <TableRow key={msg._id} className="hover:bg-slate-50/80">
                                                    <TableCell className="text-xs text-slate-600 whitespace-nowrap font-medium">
                                                        {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-bold text-xs text-slate-900">{msg.name}</div>
                                                        <div className="text-[11px] text-slate-500">{msg.email} {msg.phone ? `• ${msg.phone}` : ''}</div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium text-slate-800 max-w-[200px] truncate">
                                                        {msg.subject}
                                                    </TableCell>
                                                    <TableCell>
                                                        {msg.status === "unread" && (
                                                            <Badge className="bg-red-50 text-red-600 border border-red-200 text-[10px]">
                                                                Unread
                                                            </Badge>
                                                        )}
                                                        {msg.status === "read" && (
                                                            <Badge className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px]">
                                                                Read
                                                            </Badge>
                                                        )}
                                                        {msg.status === "replied" && (
                                                            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px]">
                                                                Replied
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedMessage(msg);
                                                                if (msg.status === "unread") {
                                                                    handleUpdateMessageStatus(msg._id, "read");
                                                                }
                                                            }}
                                                            className="h-8 w-8 p-0 text-slate-600 hover:text-[#1b5cac]"
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteMessage(msg._id)}
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Message Detail Dialog */}
            {selectedMessage && (
                <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
                    <DialogContent className="max-w-xl text-left">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-slate-900">
                                Inquiry: {selectedMessage.subject}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Sent by <span className="font-semibold text-slate-700">{selectedMessage.name}</span> ({selectedMessage.email}) on {new Date(selectedMessage.createdAt).toLocaleString()}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 my-2">
                            {selectedMessage.phone && (
                                <div className="text-xs font-medium text-slate-600">
                                    <span className="font-bold text-slate-800">Phone:</span> {selectedMessage.phone}
                                </div>
                            )}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                {selectedMessage.message}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateMessageStatus(selectedMessage._id, "read")}
                                    className={`text-xs ${selectedMessage.status === "read" ? "bg-slate-100 font-bold" : ""}`}
                                >
                                    Mark Read
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateMessageStatus(selectedMessage._id, "replied")}
                                    className={`text-xs ${selectedMessage.status === "replied" ? "bg-emerald-100 text-emerald-800 font-bold" : ""}`}
                                >
                                    Mark Replied
                                </Button>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteMessage(selectedMessage._id)}
                                className="text-xs font-bold"
                            >
                                Delete Inquiry
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Suggestion Approval Dialog */}
            {approvingSuggestion && (
                <Dialog open={!!approvingSuggestion} onOpenChange={() => setApprovingSuggestion(null)}>
                    <DialogContent className="max-w-md text-left">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-slate-900">
                                Approve Amenity Suggestion
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Set categories and target property types for <span className="font-semibold text-slate-800">"{approvingSuggestion.label}"</span>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 my-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">Property Types</Label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    {[
                                        { id: "hotel", label: "Hotel" },
                                        { id: "villa", label: "Villa" },
                                        { id: "apartment", label: "Apartment" },
                                        { id: "resort", label: "Resort" },
                                        { id: "all", label: "All Properties" }
                                    ].map((item) => (
                                        <label key={item.id} className="flex items-center space-x-2 border rounded p-2 hover:bg-slate-50 cursor-pointer text-xs">
                                            <input
                                                type="checkbox"
                                                checked={approvePropertyTypes.includes(item.id)}
                                                onChange={(e) => {
                                                    if (item.id === "all") {
                                                        if (e.target.checked) {
                                                            setApprovePropertyTypes(["all"]);
                                                        } else {
                                                            setApprovePropertyTypes([]);
                                                        }
                                                    } else {
                                                        let updated = [...approvePropertyTypes].filter(x => x !== "all");
                                                        if (e.target.checked) {
                                                            updated.push(item.id);
                                                        } else {
                                                            updated = updated.filter(x => x !== item.id);
                                                        }
                                                        setApprovePropertyTypes(updated);
                                                    }
                                                }}
                                                className="rounded text-[#1b5cac] focus:ring-[#1b5cac] size-3.5"
                                            />
                                            <span>{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="approve_category" className="text-sm font-bold text-gray-700">Category</Label>
                                <select
                                    id="approve_category"
                                    value={approveCategory}
                                    onChange={(e) => setApproveCategory(e.target.value as any)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="general">General</option>
                                    <option value="indoor">Indoor</option>
                                    <option value="outdoor">Outdoor</option>
                                    <option value="service">Service</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setApprovingSuggestion(null)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleConfirmApproveSuggestion}
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                                Confirm Approval
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-[60vh]"><Spinner className="w-8 h-8 text-[#1b5cac]" /></div>}>
            <SettingsContent />
        </Suspense>
    );
}
