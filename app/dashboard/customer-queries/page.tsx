"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDashboardRole } from "@/components/dashboard/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageSquare, RefreshCw, Trash2, Eye } from "lucide-react";
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

export default function CustomerQueriesPage() {
    const { role } = useDashboardRole();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
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
                fetchMessages();
            }
        } else {
            if (role !== "admin") {
                router.push("/dashboard");
                toast.error("Unauthorized access.");
                return;
            }
            fetchMessages();
        }
    }, [status, session, role, router]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/contact`);
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setMessages(result.data);
            }
        } catch (error) {
            console.error("Error fetching contact messages:", error);
            toast.error("Failed to load customer queries.");
        } finally {
            setLoading(false);
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

    if (status === "loading" || loading) {
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
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                        <MessageSquare className="w-6 h-6 text-[#1b5cac]" />
                        Customer Queries & Inquiries
                    </h1>
                    <p className="text-gray-500 mt-1">Review, manage, and respond to incoming customer messages.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchMessages}
                    className="gap-2 text-xs font-bold w-fit"
                >
                    <RefreshCw className="size-4" /> Refresh Messages
                </Button>
            </div>

            <Card className="shadow-sm border-gray-200 bg-white">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                                Received Inquiries
                                {unreadCount > 0 && (
                                    <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {unreadCount} Unread
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription>All messages sent via the public Contact Us form.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {messages.length === 0 ? (
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
                                            <TableCell className="text-xs font-medium text-slate-800 max-w-[220px] truncate">
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
