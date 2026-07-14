"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Save, Building2, Bed, CheckSquare, FileText, Phone, Trash2, Plus, ChevronDown, ImagePlus, Loader2, X, ImageIcon, ShieldCheck, MapPin, Home, Building } from "lucide-react";
import { toast } from "sonner";
import AddressSelector from "./AddressSelector";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ApartmentForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [owners, setOwners] = useState<any[]>([]);
  const [ownerId, setOwnerId] = useState("");

  const [indoorAmenities, setIndoorAmenities] = useState([
    { id: "wifi", label: "WiFi", checked: false },
    { id: "ac", label: "Air Conditioning", checked: false },
    { id: "kitchen", label: "Full Kitchen", checked: false },
    { id: "entertainment", label: "Entertainment System", checked: false },
    { id: "fireplace", label: "Fireplace", checked: false },
    { id: "gym", label: "Private Gym", checked: false },
    { id: "sauna", label: "Sauna", checked: false },
  ]);

  const [outdoorFeatures, setOutdoorFeatures] = useState([
    { id: "pool", label: "Private Pool", checked: false },
    { id: "garden", label: "Garden", checked: false },
    { id: "bbq", label: "BBQ Area", checked: false },
    { id: "parking", label: "Private Parking", checked: false },
    { id: "beach", label: "Beach Access", checked: false },
    { id: "dining", label: "Outdoor Dining", checked: false },
  ]);

  const [buildingFeatures, setBuildingFeatures] = useState([
    { id: "security", label: "24/7 Security", checked: false },
    { id: "elevator", label: "Elevator", checked: false },
    { id: "concierge", label: "Concierge Service", checked: false },
    { id: "maintenance", label: "24/7 Maintenance", checked: false },
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
      if (initialData.images) setImages(initialData.images);
      if (initialData.ownerId) setOwnerId(initialData.ownerId);
      
      if (initialData.amenities) {
        setIndoorAmenities(prev => prev.map(a => ({ ...a, checked: initialData.amenities.includes(a.id) })));
      }
      if (initialData.buildingFeatures) {
        setBuildingFeatures(prev => prev.map(a => ({ ...a, checked: initialData.buildingFeatures.includes(a.id) })));
      }
    }
  }, [initialData]);

  const handleToggleAmenity = (setState: React.Dispatch<React.SetStateAction<any[]>>, state: any[], id: string, checked: boolean) => {
    setState(state.map(a => a.id === id ? { ...a, checked } : a));
  };

  const handleImageUpload = async (file: File) => {
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

  const handleRemoveImage = (imageIndex: number) => {
    setImages(images.filter((_, i) => i !== imageIndex));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({}); // Clear errors
    const formData = new FormData(e.target as HTMLFormElement);

    const payload = {
      propertyName: formData.get("propertyName"),
      address: {
        country: formData.get("country"),
        state: formData.get("state"),
        city: formData.get("city"),
        addressLine: formData.get("addressLine")
      },
      description: formData.get("description"),
      apartmentType: formData.get("apartmentType"),
      propertyDetails: {
        bedrooms: Number(formData.get("bedrooms")),
        bathrooms: Number(formData.get("bathrooms")),
        floorArea: Number(formData.get("floorArea")),
        floorLevel: Number(formData.get("floorLevel")),
        maxOccupancy: Number(formData.get("maxOccupancy")),
        basePrice: Number(formData.get("basePrice")),
      },
      images: images,
      amenities: indoorAmenities.filter(a => a.checked).map(a => a.id),
      buildingFeatures: buildingFeatures.filter(a => a.checked).map(a => a.id),
      policies: {
        checkinTime: formData.get("checkinTime"),
        checkoutTime: formData.get("checkoutTime"),
        minStay: Number(formData.get("minStay")),
        cancellationPolicy: formData.get("cancellationPolicy"),
        houseRules: formData.get("houseRules"),
      },
      contact: {
        contactName: formData.get("contactName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        altPhone: formData.get("altPhone"),
      },
      ownerId: role === 'admin' ? (ownerId === 'none' || ownerId === '' ? null : ownerId) : userId
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const isEdit = !!initialData;
      const endpoint = isEdit ? `${apiUrl}/apartment/${initialData._id}` : `${apiUrl}/apartment/create`;
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
        throw new Error(result.message || 'Failed to submit apartment data');
      }

      console.log(`Apartment ${isEdit ? 'updated' : 'created'} successfully:`, result);
      toast.success(`Apartment property ${isEdit ? 'updated' : 'created'} successfully!`);
      router.push('/dashboard/properties');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Error creating apartment property. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Home className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Basic Information</CardTitle>
          </div>
          <CardDescription>Enter the primary details for your apartment.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Apartment Name <span className="text-red-500">*</span></Label>
              <Input name="propertyName" id="propertyName" defaultValue={initialData?.propertyName} placeholder="e.g. Sunset Apartment" required className={`h-12 ${fieldErrors.propertyName ? 'border-red-500' : ''}`} />
              {fieldErrors.propertyName && <p className="text-xs text-red-500 mt-1">{fieldErrors.propertyName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartmentType">Apartment Type <span className="text-red-500">*</span></Label>
              <Select name="apartmentType" defaultValue={initialData?.apartmentType} required>
                <SelectTrigger className={`h-12 ${fieldErrors.apartmentType ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Apartment</SelectItem>
                  <SelectItem value="luxury">Luxury Apartment</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="studio">Studio Apartment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea name="description" id="description" defaultValue={initialData?.description} placeholder="Describe the apartment..." rows={4} required className={fieldErrors.description ? 'border-red-500' : ''} />
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
          <CardDescription>Select the country, state, and city for this apartment.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AddressSelector fieldErrors={fieldErrors} initialData={initialData?.address} />
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building className="size-5 text-[#1b5cac]" />
              <CardTitle className="text-lg text-gray-800">Property Details</CardTitle>
            </div>
            <CardDescription>Specify the specifications and base price.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="bedrooms" className="text-xs text-muted-foreground">Number of Bedrooms <span className="text-red-500">*</span></Label>
              <Input type="number" min="1" name="bedrooms" id="bedrooms" defaultValue={initialData?.propertyDetails?.bedrooms} required className={`h-10 ${fieldErrors['propertyDetails.bedrooms'] ? 'border-red-500' : ''}`} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bathrooms" className="text-xs text-muted-foreground">Number of Bathrooms <span className="text-red-500">*</span></Label>
              <Input type="number" min="1" name="bathrooms" id="bathrooms" defaultValue={initialData?.propertyDetails?.bathrooms} required className={`h-10 ${fieldErrors['propertyDetails.bathrooms'] ? 'border-red-500' : ''}`} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxOccupancy" className="text-xs text-muted-foreground">Maximum Occupancy <span className="text-red-500">*</span></Label>
              <Input type="number" min="1" name="maxOccupancy" id="maxOccupancy" defaultValue={initialData?.propertyDetails?.maxOccupancy} required className={`h-10 ${fieldErrors['propertyDetails.maxOccupancy'] ? 'border-red-500' : ''}`} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="floorArea" className="text-xs text-muted-foreground">Floor Area (sq ft) <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" name="floorArea" id="floorArea" defaultValue={initialData?.propertyDetails?.floorArea} required className={`h-10 ${fieldErrors['propertyDetails.floorArea'] ? 'border-red-500' : ''}`} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="floorLevel" className="text-xs text-muted-foreground">Floor Level <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" name="floorLevel" id="floorLevel" defaultValue={initialData?.propertyDetails?.floorLevel} required className={`h-10 ${fieldErrors['propertyDetails.floorLevel'] ? 'border-red-500' : ''}`} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="basePrice" className="text-xs text-muted-foreground">Base Price Per Night <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" name="basePrice" id="basePrice" defaultValue={initialData?.propertyDetails?.basePrice} placeholder="0.00" required className={`h-10 ${fieldErrors['propertyDetails.basePrice'] ? 'border-red-500' : ''}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Images */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Property Images</CardTitle>
          </div>
          <CardDescription>Upload overall images for your apartment.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-start">
            {images.map((imgUrl, imgIndex) => (
              <div key={imgIndex} className="relative size-32 rounded-md overflow-hidden border bg-white group shadow-sm">
                <Image src={imgUrl} alt={`Property image ${imgIndex + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(imgIndex)}
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
                  handleImageUpload(e.target.files[0]);
                }
              }} />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Amenities & Features */}
      <Card className="px-4 py-6">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-5 text-[#1b5cac]" />
            <CardTitle className="text-lg text-gray-800">Amenities & Features</CardTitle>
          </div>
          <CardDescription>Select the facilities available at your property.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <div>
            <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
              <Home className="size-4" /> Indoor Amenities
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {indoorAmenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`indoor-${amenity.id}`}
                    checked={amenity.checked}
                    onCheckedChange={(checked) => handleToggleAmenity(setIndoorAmenities, indoorAmenities, amenity.id, checked as boolean)}
                  />
                  <Label htmlFor={`indoor-${amenity.id}`} className="font-normal cursor-pointer">
                    {amenity.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
              <Building className="size-4" /> Building Features
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {buildingFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`building-${feature.id}`}
                    checked={feature.checked}
                    onCheckedChange={(checked) => handleToggleAmenity(setBuildingFeatures, buildingFeatures, feature.id, checked as boolean)}
                  />
                  <Label htmlFor={`building-${feature.id}`} className="font-normal cursor-pointer">
                    {feature.label}
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
            <CardTitle className="text-lg text-gray-800">Policies</CardTitle>
          </div>
          <CardDescription>Set check-in rules and stay requirements.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkinTime">Check-in Time <span className="text-red-500">*</span></Label>
              <Input type="time" name="checkinTime" id="checkinTime" defaultValue={initialData?.policies?.checkinTime} required className={`h-12 ${fieldErrors['policies.checkinTime'] ? 'border-red-500' : ''}`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkoutTime">Check-out Time <span className="text-red-500">*</span></Label>
              <Input type="time" name="checkoutTime" id="checkoutTime" defaultValue={initialData?.policies?.checkoutTime} required className={`h-12 ${fieldErrors['policies.checkoutTime'] ? 'border-red-500' : ''}`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStay">Minimum Stay (nights) <span className="text-red-500">*</span></Label>
              <Input type="number" name="minStay" id="minStay" defaultValue={initialData?.policies?.minStay} required min="1" className={`h-12 ${fieldErrors['policies.minStay'] ? 'border-red-500' : ''}`} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="cancellationPolicy">Cancellation Policy <span className="text-red-500">*</span></Label>
              <Textarea name="cancellationPolicy" id="cancellationPolicy" defaultValue={initialData?.policies?.cancellationPolicy} placeholder="Enter your cancellation policy..." rows={3} required className={fieldErrors['policies.cancellationPolicy'] ? 'border-red-500' : ''} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="houseRules">House Rules</Label>
              <Textarea name="houseRules" id="houseRules" defaultValue={initialData?.policies?.houseRules} placeholder="Any special rules for guests..." rows={2} />
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input type="email" name="email" id="email" defaultValue={initialData?.contact?.email} placeholder="contact@apartment.com" required className={`h-12 ${fieldErrors['contact.email'] ? 'border-red-500' : ''}`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input type="tel" name="phone" id="phone" defaultValue={initialData?.contact?.phone} placeholder="+123 456 7890" required className={`h-12 ${fieldErrors['contact.phone'] ? 'border-red-500' : ''}`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altPhone">Alternative Phone</Label>
              <Input type="tel" name="altPhone" id="altPhone" defaultValue={initialData?.contact?.altPhone} placeholder="+123 456 7890" className="h-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 pb-12">
        <Button type="submit" size="lg" className="bg-[#1b5cac] hover:bg-[#1b5cac]/90 text-white font-bold px-8 shadow-md">
          <Save className="size-4 mr-2" />
          {initialData ? "Update" : "Submit"} Apartment Information
        </Button>
      </div>
    </form>
  );
}
