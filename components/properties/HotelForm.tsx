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
import { Save, Building2, Bed, CheckSquare, FileText, Phone, Trash2, Plus, ChevronDown, ImagePlus, Loader2, X, ImageIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import AddressSelector from "./AddressSelector";
import { useSession } from "next-auth/react";

export default function HotelForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [owners, setOwners] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState("");
  const currencyOptions = ["USD", "BDT", "EUR"];

  const [rooms, setRooms] = useState([
    { id: "1", roomType: "Single Room", name: "", capacity: 1, count: 0, publishedRate: "", agencyRate: "", images: [] as string[], uploading: false },
    { id: "2", roomType: "Double Room", name: "", capacity: 2, count: 0, publishedRate: "", agencyRate: "", images: [] as string[], uploading: false },
    { id: "3", roomType: "Suite", name: "", capacity: 4, count: 0, publishedRate: "", agencyRate: "", images: [] as string[], uploading: false }
  ]);

  const [amenities, setAmenities] = useState<{ id: string; label: string; checked: boolean }[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");

  useEffect(() => {
    const fetchDefaultAmenities = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/amenity?propertyType=hotel&isSuggested=false`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const loaded = json.data.map((a: any) => ({
            id: a.name,
            label: a.label,
            checked: false
          }));

          if (initialData?.amenities) {
            const dbAmenities = initialData.amenities.map((a: any) => a.name);
            const merged = loaded.map((item: any) => ({
              ...item,
              checked: dbAmenities.includes(item.id)
            }));
            
            initialData.amenities.forEach((dbItem: any) => {
              if (!merged.some((m: any) => m.id === dbItem.name)) {
                merged.push({
                  id: dbItem.name,
                  label: dbItem.label || dbItem.name.split(/[_-]/).filter(Boolean).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
                  checked: dbItem.isEnabled !== false
                });
              }
            });
            setAmenities(merged);
          } else {
            setAmenities(loaded);
          }
        }
      } catch (err) {
        console.error("Error fetching default amenities:", err);
      }
    };

    fetchDefaultAmenities();
  }, [initialData]);

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
      if (initialData.hotelInfo?.currencies) setCurrencies(initialData.hotelInfo.currencies);
      if (initialData.hotelInfo?.images) setImages(initialData.hotelInfo.images);
      if (initialData.hotelInfo?.ownerId) setOwnerId(initialData.hotelInfo.ownerId);
      
      if (initialData.rooms && initialData.rooms.length > 0) {
        setRooms(initialData.rooms.map((room: any) => ({
          id: room._id,
          roomType: room.roomType,
          name: room.name || "",
          capacity: room.capacity,
          count: room.count,
          publishedRate: room.publishedRate.toString(),
          agencyRate: room.agencyRate.toString(),
          images: room.images || [],
          uploading: false
        })));
      }
    }
  }, [initialData]);

  const handleAddRoom = () => {
    setRooms([...rooms, { id: Date.now().toString(), roomType: "", name: "", capacity: 1, count: 0, publishedRate: "", agencyRate: "", images: [], uploading: false }]);
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

  const handleToggleCurrency = (currency: string) => {
    if (currencies.includes(currency)) {
      setCurrencies(currencies.filter(c => c !== currency));
    } else {
      setCurrencies([...currencies, currency]);
    }
  };

  const handleToggleAmenity = (id: string, checked: boolean) => {
    setAmenities(amenities.map(a => a.id === id ? { ...a, checked } : a));
  };

  const handleAddCustomAmenity = () => {
    if (customAmenity.trim()) {
      const id = customAmenity.toLowerCase().replace(/\s+/g, '_');
      if (!amenities.some(a => a.id === id)) {
        setAmenities([...amenities, { id, label: customAmenity.trim(), checked: true }]);
      }
      setCustomAmenity("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({}); // Clear errors
    const formData = new FormData(e.target as HTMLFormElement);
    const paymentMethods = [];
    if (formData.get('payment_credit_card')) paymentMethods.push('credit_card');
    if (formData.get('payment_debit_card')) paymentMethods.push('debit_card');
    if (formData.get('payment_cash')) paymentMethods.push('cash');

    const finalOwnerId = role === 'admin' ? (ownerId === 'none' || ownerId === '' ? null : ownerId) : userId;

    const payload = {
      hotelInfo: {
        name: formData.get("propertyName"),
        starRating: formData.get("starRating"),
        address: {
          country: formData.get("country"),
          state: formData.get("state"),
          city: formData.get("city"),
          addressLine: formData.get("addressLine")
        },
        description: formData.get("description"),
        currencies: currencies,
        policies: {
          checkinTime: formData.get("checkinTime"),
          checkoutTime: formData.get("checkoutTime"),
          cancellationPolicy: formData.get("cancellationPolicy"),
          paymentMethods
        },
        contact: {
          contactName: formData.get("contactName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          website: formData.get("website")
        },
        images: images,
        ownerId: finalOwnerId
      },
      rooms: rooms.map(({ uploading, ...roomData }) => ({
          ...roomData,
          capacity: Number(roomData.capacity),
          count: Number(roomData.count),
          publishedRate: Number(roomData.publishedRate),
          agencyRate: Number(roomData.agencyRate)
      })),
      amenities: amenities.filter(a => a.checked).map(a => ({ name: a.id, isEnabled: true }))
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const isEdit = !!initialData;
      const endpoint = isEdit ? `${apiUrl}/hotel/${initialData.hotelInfo?._id || initialData.hotelInfo?.id}` : `${apiUrl}/hotel/create`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
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
      
      console.log(`Hotel ${isEdit ? 'updated' : 'created'} successfully:`, result);
      toast.success(`Hotel property ${isEdit ? 'updated' : 'created'} successfully!`);
      router.push('/dashboard/properties');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Error creating hotel property. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Basic Information</CardTitle>
          </div>
          <CardDescription>Enter the primary details for your hotel.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Hotel Name <span className="text-red-500">*</span></Label>
              <Input name="propertyName" id="propertyName" defaultValue={initialData?.hotelInfo?.name} placeholder="e.g. Grand Plaza Hotel" required className={`h-12 ${fieldErrors.name ? 'border-red-500' : ''}`} />
              {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="starRating">Star Rating <span className="text-red-500">*</span></Label>
              <Select name="starRating" defaultValue={initialData?.hotelInfo?.starRating?.toString()} required>
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
              <Textarea name="description" id="description" defaultValue={initialData?.hotelInfo?.description} placeholder="Describe the hotel..." rows={4} required className={fieldErrors.description ? 'border-red-500' : ''} />
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
          <CardDescription>Select the country, state, and city for this hotel.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AddressSelector fieldErrors={fieldErrors} initialData={initialData?.hotelInfo?.address} />
        </CardContent>
      </Card>

      {/* Property Images */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Property Images</CardTitle>
          </div>
          <CardDescription>Upload overall images for your hotel.</CardDescription>
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
              <CardTitle className="text-lg text-gray-800">Room Types & Pricing</CardTitle>
            </div>
            <CardDescription>Configure your available room types and their rates.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2 max-w-sm mb-6">
            <Label>Supported Currencies <span className="text-red-500">*</span></Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-12 font-normal text-left">
                  {currencies.length > 0 ? currencies.join(", ") : "Select Currencies..."}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[24rem]">
                {currencyOptions.map((currency) => (
                  <DropdownMenuCheckboxItem
                    key={currency}
                    checked={currencies.includes(currency)}
                    onCheckedChange={() => handleToggleCurrency(currency)}
                  >
                    {currency}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-6 mt-6">
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
                    <Label className="text-xs text-muted-foreground">Custom Name</Label>
                    <Input placeholder="e.g. Ocean View Suite" value={room.name} onChange={(e) => handleRoomChange(room.id, "name", e.target.value)} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Allowed Guests</Label>
                    <Input type="number" min="1" value={room.capacity} onChange={(e) => handleRoomChange(room.id, "capacity", parseInt(e.target.value) || 0)} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Total Rooms</Label>
                    <Input type="number" min="0" value={room.count} onChange={(e) => handleRoomChange(room.id, "count", parseInt(e.target.value) || 0)} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Published Rate</Label>
                    <Input type="number" min="0" placeholder="0.00" value={room.publishedRate} onChange={(e) => handleRoomChange(room.id, "publishedRate", e.target.value)} className={`h-10 ${fieldErrors.publishedRate ? 'border-red-500' : ''}`} />
                    {fieldErrors.publishedRate && <p className="text-[10px] text-red-500">{fieldErrors.publishedRate}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Agency Rate</Label>
                    <Input type="number" min="0" placeholder="0.00" value={room.agencyRate} onChange={(e) => handleRoomChange(room.id, "agencyRate", e.target.value)} className={`h-10 ${fieldErrors.agencyRate ? 'border-red-500' : ''}`} />
                    {fieldErrors.agencyRate && <p className="text-[10px] text-red-500">{fieldErrors.agencyRate}</p>}
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

      {/* Hotel Amenities */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Hotel Amenities</CardTitle>
          </div>
          <CardDescription>Select the facilities available at your property.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity.id}`}
                  checked={amenity.checked}
                  onCheckedChange={(checked) => handleToggleAmenity(amenity.id, checked as boolean)}
                />
                <Label htmlFor={`amenity-${amenity.id}`} className="font-normal cursor-pointer">
                  {amenity.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Label htmlFor="customAmenity" className="whitespace-nowrap">Add Custom Amenity:</Label>
            <Input
              id="customAmenity"
              placeholder="e.g. Infinity Pool"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              className="h-10 max-w-xs"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAmenity())}
            />
            <Button type="button" variant="secondary" onClick={handleAddCustomAmenity} className="h-10">
              Add
            </Button>
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
          <CardDescription>Set check-in rules and accepted payment methods.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkinTime">Check-in Time <span className="text-red-500">*</span></Label>
              <Input type="time" name="checkinTime" id="checkinTime" defaultValue={initialData?.hotelInfo?.policies?.checkinTime} required className={`h-12 ${fieldErrors['policies.checkinTime'] ? 'border-red-500' : ''}`} />
              {fieldErrors['policies.checkinTime'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['policies.checkinTime']}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkoutTime">Check-out Time <span className="text-red-500">*</span></Label>
              <Input type="time" name="checkoutTime" id="checkoutTime" defaultValue={initialData?.hotelInfo?.policies?.checkoutTime} required className={`h-12 ${fieldErrors['policies.checkoutTime'] ? 'border-red-500' : ''}`} />
              {fieldErrors['policies.checkoutTime'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['policies.checkoutTime']}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cancellationPolicy">Cancellation Policy <span className="text-red-500">*</span></Label>
              <Textarea name="cancellationPolicy" id="cancellationPolicy" defaultValue={initialData?.hotelInfo?.policies?.cancellationPolicy} placeholder="Enter your cancellation policy..." rows={3} required className={fieldErrors['policies.cancellationPolicy'] ? 'border-red-500' : ''} />
              {fieldErrors['policies.cancellationPolicy'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['policies.cancellationPolicy']}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Payment Methods</Label>
            <div className="flex flex-wrap gap-6">
              {[
                { id: 'credit_card', label: 'Credit Card' },
                { id: 'debit_card', label: 'Debit Card' },
                { id: 'cash', label: 'Cash' },
              ].map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox name={`payment_${method.id}`} id={`payment-${method.id}`} value={method.id} defaultChecked={initialData?.hotelInfo?.policies?.paymentMethods?.includes(method.id)} />
                  <Label htmlFor={`payment-${method.id}`} className="font-normal cursor-pointer">
                    {method.label}
                  </Label>
                </div>
              ))}
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
              <Input name="contactName" id="contactName" defaultValue={initialData?.hotelInfo?.contact?.contactName} placeholder="Full name of contact person" required className={`h-12 ${fieldErrors['contact.contactName'] ? 'border-red-500' : ''}`} />
              {fieldErrors['contact.contactName'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['contact.contactName']}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input type="email" name="email" id="email" defaultValue={initialData?.hotelInfo?.contact?.email} placeholder="contact@hotel.com" required className={`h-12 ${fieldErrors['contact.email'] ? 'border-red-500' : ''}`} />
              {fieldErrors['contact.email'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['contact.email']}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input type="tel" name="phone" id="phone" defaultValue={initialData?.hotelInfo?.contact?.phone} placeholder="+123 456 7890" required className={`h-12 ${fieldErrors['contact.phone'] ? 'border-red-500' : ''}`} />
              {fieldErrors['contact.phone'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['contact.phone']}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input type="url" name="website" id="website" defaultValue={initialData?.hotelInfo?.contact?.website} placeholder="https://www.yourhotel.com" className="h-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 pb-12">
        <Button type="submit" size="lg" className="bg-[#1b5cac] hover:bg-[#1b5cac]/90 text-white font-bold px-8 shadow-md">
          <Save className="size-4 mr-2" />
          {initialData ? "Update" : "Submit"} Hotel Information
        </Button>
      </div>
    </form>
  );
}
