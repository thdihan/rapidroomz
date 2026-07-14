"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Save, Building2, Bed, CheckSquare, FileText, Phone, Trash2, Plus, ImagePlus, Loader2, X, ImageIcon, Palmtree, MapPin } from "lucide-react";
import { toast } from "sonner";
import AddressSelector from "./AddressSelector";
import { useSession } from "next-auth/react";

export default function ResortForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [owners, setOwners] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState("");

  const [rooms, setRooms] = useState([
    { id: "1", roomType: "Deluxe Room", occupancy: 2, count: 0, size: 0, price: 0, images: [] as string[], uploading: false },
    { id: "2", roomType: "Beach Villa", occupancy: 4, count: 0, size: 0, price: 0, images: [] as string[], uploading: false },
    { id: "3", roomType: "Pool Villa", occupancy: 4, count: 0, size: 0, price: 0, images: [] as string[], uploading: false }
  ]);

  const [features, setFeatures] = useState([
    { id: "beach", label: "Private Beach", checked: false },
    { id: "pools", label: "Swimming Pools", checked: false },
    { id: "spa", label: "Spa & Wellness Center", checked: false },
    { id: "watersports", label: "Water Sports", checked: false },
    { id: "kids_club", label: "Kids Club", checked: false },
    { id: "restaurants", label: "Multiple Restaurants", checked: false }
  ]);

  const [activities, setActivities] = useState([
    { id: "snorkeling", label: "Snorkeling", checked: false },
    { id: "diving", label: "Scuba Diving", checked: false },
    { id: "surfing", label: "Surfing", checked: false },
    { id: "yoga", label: "Yoga Classes", checked: false },
    { id: "cooking", label: "Cooking Classes", checked: false }
  ]);

  useEffect(() => {
    if (role === 'admin') {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/user/owners`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOwners(data.data);
          }
        });
    }
  }, [role]);

  useEffect(() => {
    if (initialData) {
      if (initialData.info?.images) setImages(initialData.info.images);
      if (initialData.info?.ownerId || initialData.ownerId) setOwnerId(initialData.info?.ownerId || initialData.ownerId);
      
      if (initialData.amenities) {
        // Resort features and activities were combined in amenities in the API output
        // We'll try to check them against the IDs
        const ids = initialData.amenities.filter((a: any) => a.isEnabled).map((a: any) => a._id);
        setFeatures(prev => prev.map(a => ({ ...a, checked: ids.includes(a.id) })));
        setActivities(prev => prev.map(a => ({ ...a, checked: ids.includes(a.id) })));
      }
      
      if (initialData.rooms && initialData.rooms.length > 0) {
        setRooms(initialData.rooms.map((room: any) => ({
          id: room._id,
          roomType: room.roomType,
          occupancy: room.capacity || room.occupancy,
          count: room.count,
          size: room.size || 0,
          price: room.publishedRate || room.price,
          images: room.images || [],
          uploading: false
        })));
      }
    }
  }, [initialData]);

  const handleAddRoom = () => {
    setRooms([...rooms, { id: Date.now().toString(), roomType: "", occupancy: 1, count: 0, size: 0, price: 0, images: [], uploading: false }]);
  };

  const handleRemoveRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
  };

  const handleRoomChange = (id: string, field: string, value: string | number | boolean | string[]) => {
    setRooms(rooms.map(room => room.id === id ? { ...room, [field]: value } : room));
  };

  const handleImageUpload = async (roomId: string, file: File) => {
    if (!file) return;

    handleRoomChange(roomId, "uploading", true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      setRooms(currentRooms =>
        currentRooms.map(room => {
          if (room.id === roomId) {
            return { ...room, images: [...room.images, data.url], uploading: false };
          }
          return room;
        })
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      handleRoomChange(roomId, "uploading", false);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const handleRemoveImage = (roomId: string, imageIndex: number) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const newImages = [...room.images];
        newImages.splice(imageIndex, 1);
        return { ...room, images: newImages };
      }
      return room;
    }));
  };

  const handlePropertyImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setImages(prev => [...prev, data.url]);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePropertyImage = (imageIndex: number) => {
    setImages(images.filter((_, i) => i !== imageIndex));
  };

  const handleToggleFeature = (id: string, checked: boolean) => {
    setFeatures(features.map(f => f.id === id ? { ...f, checked } : f));
  };

  const handleToggleActivity = (id: string, checked: boolean) => {
    setActivities(activities.map(a => a.id === id ? { ...a, checked } : a));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({}); // Clear errors
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      propertyName: formData.get("propertyName"),
      starRating: Number(formData.get("starRating")),
      address: {
        country: formData.get("country"),
        state: formData.get("state"),
        city: formData.get("city"),
        addressLine: formData.get("addressLine")
      },
      description: formData.get("description"),
      policies: {
        checkinTime: formData.get("checkinTime"),
        checkoutTime: formData.get("checkoutTime"),
        cancellationPolicy: formData.get("cancellationPolicy"),
        minStay: Number(formData.get("minStay"))
      },
      contact: {
        contactName: formData.get("contactName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        website: formData.get("website")
      },
      ownerId: role === 'admin' ? (ownerId === 'none' || ownerId === '' ? null : ownerId) : userId,
      images: images,
      roomTypes: rooms.map(({ uploading, ...roomData }) => ({
          ...roomData,
          occupancy: Number(roomData.occupancy),
          count: Number(roomData.count),
          size: Number(roomData.size),
          price: Number(roomData.price)
      })),
      features: features.filter(f => f.checked).map(f => f.id),
      activities: activities.filter(a => a.checked).map(a => a.id)
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const isEdit = !!initialData;
      const endpoint = isEdit ? `${apiUrl}/resort/${initialData.info?.name ? initialData._id || initialData.id : ''}` : `${apiUrl}/resort/create`; // It uses the ID of the property
      
      // We don't have the raw property ID easily accessible if it's nested. Let's just assume we can get it or we will pass it. Actually wait, in `app/dashboard/properties/edit/[id]/page.tsx`, we pass `initialData = result.data`.
      // So initialData._id should exist. Wait, earlier we passed mapped data `setData({type, info, rooms, amenities})`.
      // I need to use `initialData._id` from the original if I didn't map it. Let's check edit page.
      // Ah! In `edit/[id]/page.tsx`, I set `setData(result.data)`. I DID NOT MAP IT! The mapper was in `/dashboard/properties/[id]/page.tsx`.
      // Let's adjust `useEffect` and `initialData` to use `result.data` properly!
      const finalEndpoint = isEdit ? `${apiUrl}/resort/${initialData._id}` : `${apiUrl}/resort/create`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(finalEndpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errorSources && Array.isArray(result.errorSources)) {
           const errors: Record<string, string> = {};
           result.errorSources.forEach((err: any) => {
               errors[err.path] = err.message;
           });
           setFieldErrors(errors);
           toast.error('Validation Error. Please check the highlighted fields.');
           return;
        }
        throw new Error(result.message || 'Failed to submit hotel data');
      }
      
      console.log(`Resort ${isEdit ? 'updated' : 'created'} successfully:`, result);
      toast.success(`Resort property ${isEdit ? 'updated' : 'created'} successfully!`);
      router.push('/dashboard/properties');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Error creating resort property. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Palmtree className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Basic Information</CardTitle>
          </div>
          <CardDescription>Enter the primary details for your resort.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Resort Name <span className="text-red-500">*</span></Label>
              <Input name="propertyName" id="propertyName" defaultValue={initialData?.propertyName} placeholder="e.g. Grand Paradise Resort" required className={`h-12 ${fieldErrors.name ? 'border-red-500' : ''}`} />
              {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="starRating">Star Rating <span className="text-red-500">*</span></Label>
              <Select name="starRating" defaultValue={initialData?.starRating?.toString()} required>
                <SelectTrigger className={`h-12 ${fieldErrors.starRating ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Star</SelectItem>
                  <SelectItem value="4">4 Star</SelectItem>
                  <SelectItem value="5">5 Star</SelectItem>
                  <SelectItem value="7">7 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea name="description" id="description" defaultValue={initialData?.description} placeholder="Describe the resort..." rows={4} required className={fieldErrors.description ? 'border-red-500' : ''} />
              {fieldErrors.description && <p className="text-xs text-red-500 mt-1">{fieldErrors.description}</p>}
            </div>
            
            {role === 'admin' && (
              <div className="space-y-2 md:col-span-2 mt-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Label htmlFor="ownerId" className="text-amber-900 font-bold">Assign Owner (Admin Only)</Label>
                <Select value={ownerId} onValueChange={setOwnerId}>
                  <SelectTrigger className="bg-white border-amber-300 h-10">
                    <SelectValue placeholder="Select an owner (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Keep unassigned)</SelectItem>
                    {owners.map(owner => (
                      <SelectItem key={owner._id} value={owner._id}>
                        {owner.name} ({owner.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-amber-700 mt-1">Leave empty to assign later. Owners manage this property.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Details */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Location Details</CardTitle>
          </div>
          <CardDescription>Select the country, state, and city for this resort.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AddressSelector fieldErrors={fieldErrors} initialData={initialData?.address} />
        </CardContent>
      </Card>

      {/* Property Images */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Property Images</CardTitle>
          </div>
          <CardDescription>Upload overall images for your resort.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-start">
            {images.map((imgUrl, imgIndex) => (
              <div key={imgIndex} className="relative size-32 rounded-md overflow-hidden border bg-white group shadow-sm">
                <Image src={imgUrl} alt={`Property image ${imgIndex + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePropertyImage(imgIndex)}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-red-500 hover:text-white p-1.5 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}

            <label className={`flex size-32 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:border-[#1b5cac] hover:bg-blue-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? (
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <ImagePlus className="size-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 font-medium">Add Image</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handlePropertyImageUpload(e.target.files[0]);
                }
              }} />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Room Types */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bed className="size-5 text-[#1b5cac]" />
              <CardTitle className="text-lg text-gray-800">Accommodation Types & Pricing</CardTitle>
            </div>
            <CardDescription>Configure your available room/villa types and their rates.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6 mt-2">
            {rooms.map((room, index) => (
              <div key={room.id} className="border rounded-lg p-5 bg-white relative shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                  <h4 className="font-semibold text-lg text-gray-800">Room #{index + 1}</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveRoom(room.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8">
                    <Trash2 className="size-4 mr-1.5" /> Remove Room
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Room Type</Label>
                    <Input placeholder="e.g. Suite" value={room.roomType} onChange={(e) => handleRoomChange(room.id, "roomType", e.target.value)} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Allowed Guests</Label>
                    <Input type="number" min="1" value={room.occupancy} onChange={(e) => handleRoomChange(room.id, "occupancy", parseInt(e.target.value) || 0)} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Number of Units</Label>
                    <Input type="number" min="0" value={room.count} onChange={(e) => handleRoomChange(room.id, "count", parseInt(e.target.value) || 0)} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Area (sq ft)</Label>
                    <Input type="number" min="0" placeholder="0" value={room.size} onChange={(e) => handleRoomChange(room.id, "size", e.target.value)} className={`h-10`} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Base Price</Label>
                    <Input type="number" min="0" placeholder="0.00" value={room.price} onChange={(e) => handleRoomChange(room.id, "price", e.target.value)} className={`h-10`} />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border">
                  <Label className="text-sm font-medium mb-3 block">Room Images</Label>
                  <div className="flex flex-wrap gap-4 items-start">
                    {room.images.map((imgUrl, imgIndex) => (
                      <div key={imgIndex} className="relative size-24 rounded-md overflow-hidden border bg-white group shadow-sm">
                        <Image src={imgUrl} alt={`Room image ${imgIndex + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(room.id, imgIndex)}
                          className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white p-1 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}

                    <label className={`flex size-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:border-[#1b5cac] hover:bg-blue-50 transition-colors ${room.uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {room.uploading ? (
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImagePlus className="size-6 text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-500 font-medium">Add Image</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(room.id, e.target.files[0]);
                        }
                      }} />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={handleAddRoom} className="mt-4 gap-2">
            <Plus className="size-4" /> Add Room Type
          </Button>
        </CardContent>
      </Card>

      {/* Resort Features */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Resort Features & Activities</CardTitle>
          </div>
          <CardDescription>Select the facilities and activities available at your property.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <div>
            <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
              <Building2 className="size-4" /> Resort Features
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${feature.id}`}
                    checked={feature.checked}
                    onCheckedChange={(checked) => handleToggleFeature(feature.id, checked as boolean)}
                  />
                  <Label htmlFor={`feature-${feature.id}`} className="font-normal cursor-pointer">
                    {feature.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
              <Palmtree className="size-4" /> Activities & Recreation
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`activity-${activity.id}`}
                    checked={activity.checked}
                    onCheckedChange={(checked) => handleToggleActivity(activity.id, checked as boolean)}
                  />
                  <Label htmlFor={`activity-${activity.id}`} className="font-normal cursor-pointer">
                    {activity.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Hotel Policies</CardTitle>
          </div>
          <CardDescription>Set check-in rules and stay requirements.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkinTime">Check-in Time <span className="text-red-500">*</span></Label>
              <Input type="time" name="checkinTime" id="checkinTime" defaultValue={initialData?.policies?.checkinTime} required className={`h-12 ${fieldErrors['policies.checkinTime'] ? 'border-red-500' : ''}`} />
              {fieldErrors['policies.checkinTime'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['policies.checkinTime']}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkoutTime">Check-out Time <span className="text-red-500">*</span></Label>
              <Input type="time" name="checkoutTime" id="checkoutTime" defaultValue={initialData?.policies?.checkoutTime} required className={`h-12 ${fieldErrors['policies.checkoutTime'] ? 'border-red-500' : ''}`} />
              {fieldErrors['policies.checkoutTime'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['policies.checkoutTime']}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStay">Minimum Stay (nights)</Label>
              <Input type="number" name="minStay" id="minStay" defaultValue={initialData?.policies?.minStay} min="1" className="h-12" />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="cancellationPolicy">Cancellation Policy <span className="text-red-500">*</span></Label>
              <Textarea name="cancellationPolicy" id="cancellationPolicy" defaultValue={initialData?.policies?.cancellationPolicy} placeholder="Enter your cancellation policy..." rows={3} required className={fieldErrors['policies.cancellationPolicy'] ? 'border-red-500' : ''} />
              {fieldErrors['policies.cancellationPolicy'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['policies.cancellationPolicy']}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Phone className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Contact Information</CardTitle>
          </div>
          <CardDescription>How guests and admins can reach the property manager.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Person <span className="text-red-500">*</span></Label>
              <Input name="contactName" id="contactName" defaultValue={initialData?.contact?.contactName} placeholder="Full name of contact person" required className={`h-12 ${fieldErrors['contact.contactName'] ? 'border-red-500' : ''}`} />
              {fieldErrors['contact.contactName'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['contact.contactName']}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input type="email" name="email" id="email" defaultValue={initialData?.contact?.email} placeholder="contact@resort.com" required className={`h-12 ${fieldErrors['contact.email'] ? 'border-red-500' : ''}`} />
              {fieldErrors['contact.email'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['contact.email']}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input type="tel" name="phone" id="phone" defaultValue={initialData?.contact?.phone} placeholder="+123 456 7890" required className={`h-12 ${fieldErrors['contact.phone'] ? 'border-red-500' : ''}`} />
              {fieldErrors['contact.phone'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['contact.phone']}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input type="url" name="website" id="website" defaultValue={initialData?.contact?.website} placeholder="https://www.yourresort.com" className="h-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 pb-12">
        <Button type="submit" size="lg" className="bg-[#1b5cac] hover:bg-[#1b5cac]/90 text-white font-bold px-8 shadow-md">
          <Save className="size-4 mr-2" />
          {initialData ? "Update" : "Submit"} Resort Information
        </Button>
      </div>
    </form>
  );
}
