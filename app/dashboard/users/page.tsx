"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users, Mail, Phone, CalendarDays, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            const role = (session?.user as any)?.role;
            if (role !== "admin") {
                router.push("/dashboard");
                toast.error("Unauthorized access.");
                return;
            }
            fetchUsers();
        }
    }, [status, session, router]);

    const fetchUsers = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/user`);
            const result = await response.json();

            if (result.success) {
                setUsers(result.data);
            } else {
                toast.error("Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("An error occurred while fetching users.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const payload = Object.fromEntries(formData.entries());
        
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${apiUrl}/user/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if (result.success) {
                toast.success("User added successfully!");
                setIsAddUserOpen(false);
                fetchUsers();
            } else {
                toast.error(result.message || "Failed to add user");
            }
        } catch (error) {
            console.error("Error adding user:", error);
            toast.error("An error occurred");
        } finally {
            setIsAdding(false);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#1b5cac]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#1b5cac]" />
                        Users Directory
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and view all registered users in the platform.</p>
                </div>

                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#1b5cac] hover:bg-[#1b5cac]/90 shadow-sm">
                            <UserPlus className="w-4 h-4 mr-2" /> Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogDescription>
                                Create a new user manually. They will be able to log in immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddUser} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" required placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" required placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" required placeholder="+1234567890" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select name="role" defaultValue="owner">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="guest">Guest (User)</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full bg-[#1b5cac] hover:bg-[#1b5cac]/90" disabled={isAdding}>
                                {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create User
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="shadow-sm border-gray-100 bg-white">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                    <CardTitle className="text-lg text-gray-800">All Users</CardTitle>
                    <CardDescription>A comprehensive list of admins, owners, and standard users.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-900">No users found</p>
                            <p className="text-sm">There are currently no users registered in the system.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Name</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Email</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Role</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Phone</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Joined Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="font-medium text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1b5cac] flex items-center justify-center font-bold text-xs uppercase">
                                                        {user.name.substring(0, 2)}
                                                    </div>
                                                    {user.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                    {user.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize
                                                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                                      user.role === 'owner' ? 'bg-amber-100 text-amber-700' : 
                                                      'bg-green-100 text-green-700'}`}
                                                >
                                                    {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                    {user.phone || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                                    {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "N/A"}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
