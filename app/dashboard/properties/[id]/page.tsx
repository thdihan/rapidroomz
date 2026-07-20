"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, MapPin, Star, Building2, Bed, CheckSquare, FileText, 
  Phone, Edit, Home, Mail, Globe, Users, Maximize, Ruler, List, User
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";

export default function SinglePropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const propertyId = unwrappedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyType = searchParams.get("type") || "hotel";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const response = await fetch(`${apiUrl}/${propertyType}/${propertyId}`);
        if (!response.ok) throw new Error('Failed to fetch property details');
        
        const result = await response.json();
        if (result.success) {
          if (propertyType === 'villa') {
            const v = result.data;
            setData({
              type: 'villa',
              info: {
                name: v.propertyName,
                address: v.address ? `${v.address.addressLine}, ${v.address.city}, ${v.address.state ? v.address.state + ', ' : ''}${v.address.country}` : 'N/A',
                description: v.description,
                images: v.images || [],
                currencies: ['USD', 'BDT'],
                contact: {
                  contactName: v.contact.managerName,
                  email: v.contact.email,
                  phone: v.contact.phone,
                  website: null
                },
                ownerId: v.ownerId,
                policies: {
                  checkinTime: v.policies.checkinTime,
                  checkoutTime: v.policies.checkoutTime,
                  cancellationPolicy: v.policies.cancellationPolicy,
                  paymentMethods: []
                }
              },
              rooms: [],
              amenities: [
                ...(v.indoorAmenities || []).map((a: string) => ({ _id: a, name: a, isEnabled: true })),
                ...(v.outdoorFeatures || []).map((a: string) => ({ _id: a, name: a, isEnabled: true })),
                ...(v.services || []).map((a: string) => ({ _id: a, name: a, isEnabled: true }))
              ],
              propertyDetails: v.propertyDetails
            });
          } else if (propertyType === 'apartment') {
            const a = result.data;
            setData({
              type: 'apartment',
              info: {
                name: a.propertyName,
                address: a.address ? `${a.address.addressLine}, ${a.address.city}, ${a.address.state ? a.address.state + ', ' : ''}${a.address.country}` : 'N/A',
                description: a.description,
                images: a.images || [],
                currencies: ['USD', 'BDT'],
                contact: {
                  contactName: a.contact.contactName,
                  email: a.contact.email,
                  phone: a.contact.phone,
                  website: null
                },
                ownerId: a.ownerId,
                policies: {
                  checkinTime: a.policies.checkinTime,
                  checkoutTime: a.policies.checkoutTime,
                  cancellationPolicy: a.policies.cancellationPolicy,
                  paymentMethods: []
                }
              },
              rooms: [],
              amenities: [
                ...(a.amenities || []).map((am: string) => ({ _id: am, name: am, isEnabled: true })),
                ...(a.buildingFeatures || []).map((bf: string) => ({ _id: bf, name: bf, isEnabled: true }))
              ],
              propertyDetails: a.propertyDetails
            });
          } else if (propertyType === 'resort') {
            const r = result.data;
            setData({
              type: 'resort',
              info: {
                name: r.propertyName,
                address: r.address ? `${r.address.addressLine}, ${r.address.city}, ${r.address.state ? r.address.state + ', ' : ''}${r.address.country}` : 'N/A',
                description: r.description,
                images: r.images || [],
                currencies: ['USD', 'BDT'],
                starRating: r.starRating,
                contact: {
                  contactName: r.contact.contactName,
                  email: r.contact.email,
                  phone: r.contact.phone,
                  website: r.contact.website
                },
                ownerId: r.ownerId,
                policies: {
                  checkinTime: r.policies.checkinTime,
                  checkoutTime: r.policies.checkoutTime,
                  cancellationPolicy: r.policies.cancellationPolicy,
                  paymentMethods: []
                }
              },
              rooms: (r.roomTypes || []).map((rt: any) => ({
                _id: rt._id,
                roomType: rt.roomType,
                capacity: rt.occupancy,
                count: rt.count,
                publishedRate: rt.price,
                agencyRate: rt.price,
                images: rt.images || []
              })),
              amenities: [
                ...(r.features || []).map((f: string) => ({ _id: f, name: f, isEnabled: true })),
                ...(r.activities || []).map((a: string) => ({ _id: a, name: a, isEnabled: true }))
              ]
            });
          } else {
            setData({
              type: 'hotel',
              info: { 
                ...result.data.hotelInfo, 
                address: result.data.hotelInfo.address ? `${result.data.hotelInfo.address.addressLine}, ${result.data.hotelInfo.address.city}, ${result.data.hotelInfo.address.state ? result.data.hotelInfo.address.state + ', ' : ''}${result.data.hotelInfo.address.country}` : 'N/A',
                images: result.data.hotelInfo.images || [] 
              },
              rooms: result.data.rooms || [],
              amenities: result.data.amenities || []
            });
          }
        } else {
          throw new Error(result.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, propertyType]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading property assets...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-red-50/50 rounded-2xl border border-red-100 max-w-lg mx-auto mt-20">
        <p className="mb-4 text-red-600 font-semibold">{error || "Failed to load property data."}</p>
        <Button variant="outline" onClick={() => router.back()} className="rounded-md font-semibold cursor-pointer border-slate-200">
          <ArrowLeft className="size-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const { info, rooms, amenities, type, propertyDetails } = data;
  const heroImage = info.images?.[0] || "/placeholder-property.jpg";

  return (
    <div className="space-y-8 pb-12 animate-fade-in bg-[#f8fafc] min-h-screen -mx-4 sm:-mx-6 -mt-4 sm:-mt-6">
      
      {/* Immersive Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden flex flex-col justify-between rounded-b-2xl">
        {/* Blurred Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/10 backdrop-blur-[2px]" />
        
        {/* Header Actions */}
        <div className="relative z-1 px-8 pt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md transition-all font-semibold cursor-pointer shadow-sm">
            <ArrowLeft className="size-4 mr-2" /> Back
          </Button>
          <Button className="rounded-md bg-[#1b5cac] hover:bg-[#1b5cac]/90 text-white font-bold tracking-wide transition-all shadow-sm cursor-pointer flex items-center gap-2 border-0 text-sm" onClick={() => router.push(`/dashboard/properties/edit/${propertyId}?type=${propertyType}`)}>
            <Edit className="size-4" /> Edit Property Info
          </Button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-8 pb-10 max-w-6xl">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-black tracking-widest uppercase rounded-full shadow-sm">
              {type === 'hotel' && 'Hotel'}
              {type === 'resort' && 'Resort'}
              {type === 'villa' && 'Luxury Villa'}
              {type === 'apartment' && 'Service Apartment'}
            </span>
            {(type === 'hotel' || type === 'resort') && info.starRating && (
              <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-md border border-amber-400 text-white text-xs font-black tracking-widest uppercase rounded-full flex items-center gap-1 shadow-sm">
                <Star className="size-3.5 fill-current" /> {info.starRating} Star
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2 drop-shadow-lg">{info.name}</h1>
          <p className="text-slate-300 font-medium flex items-center gap-2 text-lg drop-shadow-md">
            <MapPin className="size-5 text-indigo-400" />
            {info.address}
          </p>
        </div>
      </div>

      <div className="px-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Content Area (Spans 8 cols) */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* About Property Glass Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="size-5 text-indigo-600" />
                About Property
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {info.description}
              </p>
              
              {info.currencies && info.currencies.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted Currencies</span>
                  <div className="flex gap-2">
                    {info.currencies.map((curr: string) => (
                      <span key={curr} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                        {curr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Grid */}
            {info.images && info.images.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <List className="size-5 text-indigo-600" />
                  Media Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {info.images.slice(0, 4).map((img: string, idx: number) => (
                    <div key={idx} className={`relative rounded-2xl overflow-hidden group cursor-pointer border border-slate-200/50 shadow-sm ${idx === 0 ? 'col-span-2 row-span-2 md:h-[400px]' : 'h-[194px]'}`}>
                      <Image src={img} alt={`Property image ${idx + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {idx === 3 && info.images.length > 4 && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:bg-slate-900/70">
                          <span className="text-white font-bold text-lg">+{info.images.length - 4} Photos</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room / Property Layout Details */}
            <div className="space-y-4">
               <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Bed className="size-5 text-indigo-600" />
                {type === 'hotel' || type === 'resort' ? 'Room Inventory' : 'Property Layout'}
              </h2>

              {type === 'hotel' || type === 'resort' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rooms.map((room: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className="h-48 relative overflow-hidden bg-slate-100">
                        {room.images && room.images.length > 0 ? (
                           <Image src={room.images[0]} alt={room.roomType} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                           <div className="flex h-full items-center justify-center text-slate-400">No Image provided</div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                          <Bed className="size-3.5 text-indigo-600" />
                          {room.capacity} Guests
                        </div>
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                          <Building2 className="size-3.5 text-indigo-300" />
                          {room.count} Units
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{room.name || room.roomType}</h3>
                        <p className="text-sm text-slate-500 mb-4">{room.roomType} Configuration</p>
                        
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                          <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600 mb-1">Published</p>
                            <p className="font-bold text-slate-800">৳ {room.publishedRate.toLocaleString()}</p>
                          </div>
                          <div className="w-px h-8 bg-slate-200"></div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase font-black tracking-widest text-indigo-600 mb-1">Agency</p>
                            <p className="font-bold text-slate-800">৳ {room.agencyRate.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {rooms.length === 0 && (
                    <div className="col-span-1 md:col-span-2 p-12 text-center bg-white border border-dashed border-slate-300 rounded-3xl text-slate-500">
                      <Bed className="size-12 mx-auto text-slate-300 mb-3" />
                      <p className="font-medium text-lg">No room inventory found.</p>
                      <p className="text-sm">Configure rooms via the edit panel.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                        <Bed className="size-6 text-indigo-500 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Bedrooms</span>
                        <span className="text-2xl font-black text-slate-800">{propertyDetails?.bedrooms || 0}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                        <Maximize className="size-6 text-indigo-500 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Bathrooms</span>
                        <span className="text-2xl font-black text-slate-800">{propertyDetails?.bathrooms || 0}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                        <Users className="size-6 text-indigo-500 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Occupancy</span>
                        <span className="text-2xl font-black text-slate-800">{propertyDetails?.maxOccupancy || 0}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                        <Ruler className="size-6 text-indigo-500 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Area (sq ft)</span>
                        <span className="text-2xl font-black text-slate-800">{type === 'villa' ? propertyDetails?.indoorArea : propertyDetails?.floorArea || 0}</span>
                      </div>
                   </div>
                   <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-xs uppercase font-black tracking-widest text-slate-400 mb-1">Base Price Per Night</p>
                        <p className="text-3xl font-black text-indigo-600">৳ {propertyDetails?.basePrice?.toLocaleString() || 0}</p>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Amenities Glass Panel */}
             <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <CheckSquare className="size-5 text-indigo-600" />
                  Premium Amenities
                </h2>
                <div className="flex flex-wrap gap-3">
                  {amenities.filter((a: any) => a.isEnabled).map((amenity: any) => (
                    <span key={amenity._id} className="px-4 py-2 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 text-sm font-semibold rounded-xl capitalize transition-colors">
                      {amenity.name.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {amenities.filter((a: any) => a.isEnabled).length === 0 && <span className="text-sm font-medium text-slate-400">No amenities listed.</span>}
                </div>
            </div>

          </div>

          {/* Sidebar / Info Column (Spans 4 cols) */}
          <div className="xl:col-span-4 space-y-6">
            
             {/* Policy Box */}
             <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                  <FileText className="size-5 text-indigo-600" /> Operating Policies
                </h3>
                <div className="space-y-6 relative z-10">
                   <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                        <p className="font-bold text-slate-700">{info.policies.checkinTime}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Check Out</p>
                        <p className="font-bold text-slate-700">{info.policies.checkoutTime}</p>
                      </div>
                   </div>
                   
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cancellation Rules</p>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 rounded-xl p-4 shadow-sm">{info.policies.cancellationPolicy}</p>
                   </div>

                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Accepted Payments</p>
                      <div className="flex flex-wrap gap-2">
                        {info.policies.paymentMethods && info.policies.paymentMethods.map((pm: string) => (
                          <span key={pm} className="text-xs font-bold bg-white shadow-sm border border-slate-100 px-3 py-1.5 rounded-lg capitalize text-slate-700">
                            {pm.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* Contact Glass Panel */}
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 border-t-[6px] border-t-indigo-600 relative overflow-hidden">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10 text-slate-800">
                  <Phone className="size-5 text-indigo-600" /> Contact Hub
                </h3>
                
                <div className="space-y-4 relative z-10">
                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                       <User className="size-5 text-indigo-600" />
                     </div>
                     <div>
                       <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Manager</p>
                       <p className="font-bold text-slate-800">{info.contact.contactName}</p>
                     </div>
                   </div>

                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                       <Mail className="size-5 text-indigo-600" />
                     </div>
                     <div>
                       <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Email Address</p>
                       <p className="font-bold text-sm break-all text-slate-800">{info.contact.email}</p>
                     </div>
                   </div>

                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                       <Phone className="size-5 text-indigo-600" />
                     </div>
                     <div>
                       <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Phone Number</p>
                       <p className="font-bold text-slate-800">{info.contact.phone}</p>
                     </div>
                   </div>

                   {info.contact.website && (
                     <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                         <Globe className="size-5 text-indigo-600" />
                       </div>
                       <div>
                         <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Website</p>
                         <a href={info.contact.website} target="_blank" className="font-bold text-sm text-indigo-600 hover:underline transition-colors">{info.contact.website}</a>
                       </div>
                     </div>
                   )}
                </div>
             </div>

             {/* Owner Details Panel */}
             {info.ownerId && typeof info.ownerId === 'object' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Building2 className="size-5 text-indigo-600" /> Proprietor Info
                  </h3>
                  <div className="space-y-4">
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Name</p>
                       <p className="font-bold text-slate-700">{info.ownerId.name}</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                       <p className="font-semibold text-slate-600 text-sm">{info.ownerId.email}</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                       <p className="font-semibold text-slate-600 text-sm">{info.ownerId.phone}</p>
                     </div>
                  </div>
                </div>
             )}

          </div>

        </div>
      </div>
    </div>
  );
}
