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
            }
        } else {
            if (role !== "admin") {
                router.push("/dashboard");
                toast.error("Unauthorized access.");
                return;
            }
            fetchSettings();
            fetchMessages();
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
