"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Star, Building2, Bed, CheckSquare, FileText, Phone, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import SearchBar from "@/components/shared/SearchBar";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export default function PublicSinglePropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const propertyId = unwrappedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyType = searchParams.get("type") || "hotel";
  const urlCheckIn = searchParams.get("checkIn") || "";
  const urlCheckOut = searchParams.get("checkOut") || "";
  const urlGuests = searchParams.get("guests") || "2";

  const { data: session, update } = useSession();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<{ bookedRooms: Record<string, number>, isSinglePropertyBooked: boolean } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  // Room Modal State
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomImageIndex, setRoomImageIndex] = useState(0);

  const openRoomModal = (room: any) => {
    setSelectedRoom(room);
    setRoomImageIndex(0);
    setIsRoomModalOpen(true);
  };

  // Booking State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [noOfRooms, setNoOfRooms] = useState(1);
  const [bookingError, setBookingError] = useState('');
  const [selectedRoomsList, setSelectedRoomsList] = useState<any[]>([]);

  // Villa/Apartment specific booking state
  const [singlePropCheckIn, setSinglePropCheckIn] = useState(urlCheckIn);
  const [singlePropCheckOut, setSinglePropCheckOut] = useState(urlCheckOut);

  // Sync state if URL changes
  useEffect(() => {
    if (urlCheckIn) setSinglePropCheckIn(urlCheckIn);
    if (urlCheckOut) setSinglePropCheckOut(urlCheckOut);
  }, [urlCheckIn, urlCheckOut]);

  useEffect(() => {
    // Restore selection if available
    const stored = sessionStorage.getItem('currentBooking');
    if (stored) {
      try {
        const payload = JSON.parse(stored);
        if (payload.property.id === propertyId && payload.selectedRooms) {
          setSelectedRoomsList(payload.selectedRooms);
        }
      } catch(e) {}
    }
  }, [propertyId]);

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginPending, setIsLoginPending] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoginPending(true);
    try {
      const res = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
        setIsLoginPending(false);
        return;
      }
      toast.success("Logged in successfully!");
      setIsLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      update();
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred.");
      setIsLoginPending(false);
    }
  };

  const proceedToCheckout = () => {
    if (!session) {
      setIsLoginModalOpen(true);
      return;
    }

    let payload: any = {};
    if (type === 'villa' || type === 'apartment') {
      if (!singlePropCheckIn || !singlePropCheckOut) {
        toast.error("Please select both check-in and check-out dates.");
        return;
      }
      const inDate = new Date(singlePropCheckIn);
      const outDate = new Date(singlePropCheckOut);
      if (outDate <= inDate) {
        toast.error("Check-out date must be after check-in date.");
        return;
      }

      const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const basePrice = propertyDetails?.basePrice || 0;
      const totalPrice = basePrice * nights;

      payload = {
        property: { id: propertyId, name: info.name, type },
        selectedRooms: [
          {
            room: { name: type === 'villa' ? 'Entire Villa' : 'Entire Apartment' },
            checkIn: singlePropCheckIn,
            checkOut: singlePropCheckOut,
            noOfRooms: 1,
            nights,
            totalPrice
          }
        ],
        totalPrice
      };
    } else {
      if (selectedRoomsList.length === 0) {
        toast.error("Please select at least one room to proceed.");
        return;
      }
      payload = {
        property: { id: propertyId, name: info.name, type },
        selectedRooms: selectedRoomsList,
        totalPrice: selectedRoomsList.reduce((acc, curr) => acc + curr.totalPrice, 0)
      };
    }

    sessionStorage.setItem('currentBooking', JSON.stringify(payload));
    router.push('/checkout');
  };

  const openBookingModal = (room: any) => {
    // Prevent multiple selection of the same room
    if (selectedRoomsList.some(r => r.room._id === room._id)) {
      alert("This room is already selected. Please remove it from the booking summary first if you want to change it.");
      return;
    }
    setBookingRoom(room);
    setCheckIn('');
    setCheckOut('');
    setNoOfRooms(1);
    setBookingError('');
    setIsBookingModalOpen(true);
  };

  const confirmBookingSelection = () => {
    setBookingError('');
    if (!checkIn || !checkOut) {
      setBookingError('Please select both check-in and check-out dates.');
      return;
    }
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (outDate <= inDate) {
      setBookingError('Check-out date must be after check-in date.');
      return;
    }
    if (noOfRooms < 1 || noOfRooms > bookingRoom.count) {
      setBookingError(`Please select a valid number of rooms (Max: ${bookingRoom.count}).`);
      return;
    }
    
    // Calculate nights and total price
    const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = bookingRoom.publishedRate * noOfRooms * nights;

    setSelectedRoomsList(prev => [...prev, {
      room: bookingRoom,
      checkIn,
      checkOut,
      noOfRooms,
      nights,
      totalPrice
    }]);

    setIsBookingModalOpen(false);
    if (isRoomModalOpen) setIsRoomModalOpen(false);
  };

  const removeSelectedRoom = (roomId: string) => {
    setSelectedRoomsList(prev => prev.filter(r => r.room._id !== roomId));
  };

  useEffect(() => {
    const fetchProperty = async () => {
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        
        let apiFailed = false;
        let result: any = null;
        let availResult: any = null;

        try {
          const response = await fetch(`${apiUrl}/${propertyType}/${propertyId}`);
          if (!response.ok) {
            apiFailed = true;
          } else {
            result = await response.json();
            if (!result.success) apiFailed = true;
          }
          
          if (urlCheckIn && urlCheckOut) {
            const availResponse = await fetch(`${apiUrl}/booking/availability/${propertyId}?checkIn=${urlCheckIn}&checkOut=${urlCheckOut}`);
            if (availResponse.ok) {
                const availJson = await availResponse.json();
                if (availJson.success) {
                    availResult = availJson.data;
                }
            }
          }
        } catch (e) {
          apiFailed = true;
        }

        if (availResult) setAvailability(availResult);

        if (!apiFailed && result && result.success) {
          if (propertyType === 'villa') {
            const v = result.data;
            setData({
              type: 'villa',
              info: {
                name: v.propertyName,
                address: v.address ? `${v.address.addressLine || ''}, ${v.address.city || ''}, ${v.address.state ? v.address.state + ', ' : ''}${v.address.country || ''}` : 'N/A',
                description: v.description,
                images: v.images || [],
                currencies: ['USD', 'BDT'],
                contact: {
                  contactName: v.contact?.managerName || 'N/A',
                  email: v.contact?.email || 'N/A',
                  phone: v.contact?.phone || 'N/A',
                  website: null
                },
                policies: v.policies || {}
              },
              rooms: [],
              amenities: [
                ...(v.indoorAmenities || []).map((a: string) => ({ _id: a, name: a, isEnabled: true })),
                ...(v.outdoorFeatures || []).map((a: string) => ({ _id: a, name: a, isEnabled: true })),
                ...(v.services || []).map((a: string) => ({ _id: a, name: a, isEnabled: true }))
              ],
              propertyDetails: v.propertyDetails || {}
            });
          } else if (propertyType === 'apartment') {
            const a = result.data;
            setData({
              type: 'apartment',
              info: {
                name: a.propertyName,
                address: a.address ? `${a.address.addressLine || ''}, ${a.address.city || ''}, ${a.address.state ? a.address.state + ', ' : ''}${a.address.country || ''}` : 'N/A',
                description: a.description,
                images: a.images || [],
                currencies: ['USD', 'BDT'],
                contact: {
                  contactName: a.contact?.contactName || 'N/A',
                  email: a.contact?.email || 'N/A',
                  phone: a.contact?.phone || 'N/A',
                  website: null
                },
                policies: a.policies || {}
              },
              rooms: [],
              amenities: [
                ...(a.amenities || []).map((am: string) => ({ _id: am, name: am, isEnabled: true })),
                ...(a.buildingFeatures || []).map((bf: string) => ({ _id: bf, name: bf, isEnabled: true }))
              ],
              propertyDetails: a.propertyDetails || {}
            });
          } else if (propertyType === 'resort') {
            const r = result.data;
            setData({
              type: 'resort',
              info: {
                name: r.propertyName,
                address: r.address ? `${r.address.addressLine || ''}, ${r.address.city || ''}, ${r.address.state ? r.address.state + ', ' : ''}${r.address.country || ''}` : 'N/A',
                description: r.description,
                images: r.images || [],
                currencies: ['USD', 'BDT'],
                starRating: r.starRating,
                contact: {
                  contactName: r.contact?.contactName || 'N/A',
                  email: r.contact?.email || 'N/A',
                  phone: r.contact?.phone || 'N/A',
                  website: r.contact?.website
                },
                policies: r.policies || {}
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
            // Hotel default
            setData({
              type: 'hotel',
              info: { 
                ...result.data.hotelInfo, 
                address: result.data.hotelInfo?.address ? `${result.data.hotelInfo.address.addressLine || ''}, ${result.data.hotelInfo.address.city || ''}, ${result.data.hotelInfo.address.state ? result.data.hotelInfo.address.state + ', ' : ''}${result.data.hotelInfo.address.country || ''}` : 'N/A',
                images: result.data.hotelInfo?.images || [] 
              },
              rooms: result.data.rooms || [],
              amenities: result.data.amenities || []
            });
          }
        } else {
          // Fallback to mock data if API fails or ID is mock
          const { mockHotels } = await import('@/data/mocdata');
          const mockProp = mockHotels.find(h => h.id === propertyId);
          if (mockProp) {
            setData({
              type: mockProp.type || 'hotel',
              info: {
                name: mockProp.name,
                address: mockProp.location,
                description: "Experience luxury and comfort in our meticulously designed rooms and suites. This property offers breathtaking views and world-class amenities to ensure a memorable stay.",
                images: [mockProp.image, mockProp.image, mockProp.image],
                currencies: ['USD', 'BDT'],
                starRating: mockProp.rating,
                contact: {
                  contactName: 'Property Manager',
                  email: 'contact@example.com',
                  phone: '+1 234 567 8900',
                  website: null
                },
                policies: {
                  checkinTime: '14:00',
                  checkoutTime: '11:00',
                  cancellationPolicy: 'Free cancellation up to 48 hours prior to arrival. Changes or cancellations made after this time will incur a fee equivalent to the first night\'s room rate and tax.',
                  paymentMethods: ['credit_card', 'cash', 'bank_transfer']
                }
              },
              rooms: mockProp.type === 'hotel' || mockProp.type === 'resort' || !mockProp.type ? [
                {
                  _id: 'r1',
                  name: 'Deluxe Room',
                  roomType: 'Deluxe',
                  capacity: 2,
                  count: 5,
                  publishedRate: mockProp.price,
                  agencyRate: mockProp.price * 0.9,
                  images: [mockProp.image]
                },
                {
                  _id: 'r2',
                  name: 'Premium Suite',
                  roomType: 'Suite',
                  capacity: 4,
                  count: 2,
                  publishedRate: mockProp.price * 1.5,
                  agencyRate: mockProp.price * 1.35,
                  images: [mockProp.image]
                }
              ] : [],
              amenities: mockProp.amenities.map(a => ({ _id: a, name: a, isEnabled: true })),
              propertyDetails: {
                basePrice: mockProp.price,
                bedrooms: 3,
                bathrooms: 2,
                maxOccupancy: 6,
                indoorArea: 1800,
                floorArea: 1800,
                floorLevel: 2
              }
            });
          } else {
            throw new Error('Failed to fetch property details');
          }
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
    return <div className="container py-20 text-center text-muted-foreground animate-pulse">Loading property details...</div>;
  }

  if (error || !data) {
    return (
      <div className="container py-20 text-center text-red-500">
        <p className="mb-4">Error loading property: {error}</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const { info, rooms, amenities, type, propertyDetails } = data;

  const allImages = Array.from(new Set([
    ...(info.images || []),
    ...(rooms || []).flatMap((r: any) => r.images || [])
  ])).filter(Boolean);

  return (
    <div className="bg-[#EDF2F7] min-h-screen pb-12">
      {/* Hero Section */}
      <div className="w-full h-[500px] md:h-[600px] relative bg-gray-900">
        {info.images && info.images.length > 0 ? (
          <Image src={info.images[0]} alt={info.name} fill className="object-cover opacity-70" priority />
        ) : (
          <div className="w-full h-full bg-[#1b5cac] opacity-80 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{info.name}</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        
        {/* Hero Content aligned to bottom */}
        <div className="absolute bottom-0 left-0 w-full pb-10 pt-32">
          <div className="container mx-auto px-4 md:px-8">
            <Button variant="secondary" size="sm" onClick={() => router.back()} className="mb-8 rounded-full bg-white/20 hover:bg-white/40 text-white border-0 backdrop-blur shadow-sm transition-all">
              <ArrowLeft className="size-4 mr-2" /> Back to listings
            </Button>
            
            <div className="flex flex-col gap-3 max-w-4xl">
              <div className="flex items-center gap-2 mb-1">
                {type === 'hotel' && <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-md uppercase tracking-wider shadow-sm">{info.starRating} Star Hotel</span>}
                {type === 'resort' && <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-md uppercase tracking-wider shadow-sm">{info.starRating} Star Resort</span>}
                {type === 'villa' && <span className="px-3 py-1 bg-[#1b5cac] text-white text-xs font-bold rounded-md uppercase tracking-wider shadow-sm">Villa</span>}
                {type === 'apartment' && <span className="px-3 py-1 bg-[#1b5cac] text-white text-xs font-bold rounded-md uppercase tracking-wider shadow-sm">Apartment</span>}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg leading-tight tracking-tight">{info.name}</h1>
              <p className="flex items-center gap-2 text-white/90 mt-2 font-medium text-lg drop-shadow-md">
                <MapPin className="size-5 text-white/80" /> {info.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Menu */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 md:px-8">
          <ul className="flex gap-8 overflow-x-auto hide-scrollbar text-sm font-semibold text-gray-600">
            <li><a href="#overview" className="block py-4 hover:text-primary border-b-2 border-transparent focus:text-primary active:border-primary transition-colors">Overview</a></li>
            <li><a href="#prices" className="block py-4 hover:text-primary border-b-2 border-transparent focus:text-primary active:border-primary transition-colors">Prices</a></li>
            <li><a href="#facilities" className="block py-4 hover:text-primary border-b-2 border-transparent focus:text-primary active:border-primary transition-colors">Facilities</a></li>
            <li><a href="#policies" className="block py-4 hover:text-primary border-b-2 border-transparent focus:text-primary active:border-primary transition-colors">Policies</a></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto pt-10 px-4 md:px-8">
        {/* Search Bar specific to this property */}
        <div className="mb-8">
            <SearchBar 
                variant="compact" 
                onSubmit={(query) => {
                    query.set("type", propertyType);
                    router.push(`/properties/${propertyId}?${query.toString()}`);
                }} 
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview Section */}
            <div id="overview" className="scroll-mt-24 space-y-8">
              {/* Image Gallery */}
              {allImages.length > 0 && (
                <Card className="border-0 shadow-sm overflow-hidden">
                  <CardHeader className="p-6 md:p-8 pb-0">
                    <CardTitle className="text-2xl font-bold text-gray-800">Gallery</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                      {/* Main big image */}
                      <div onClick={() => openModal(0)} className="col-span-2 row-span-2 relative h-[250px] md:h-[416px] rounded-xl overflow-hidden group cursor-pointer shadow-sm">
                        <Image src={allImages[0] as string} alt="Main" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                      {/* Smaller images */}
                      {allImages.slice(1, 5).map((img: any, idx: number) => (
                        <div onClick={() => openModal(idx + 1)} key={idx} className="relative h-[121px] md:h-[200px] rounded-xl overflow-hidden group cursor-pointer shadow-sm">
                          <Image src={img as string} alt={`Gallery ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                          {idx === 3 && allImages.length > 5 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg md:text-xl backdrop-blur-sm">
                              +{allImages.length - 5}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">About this property</h2>
                  <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                    {info.description || "No description provided for this property."}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rooms or Villa Details Section */}
            <div id="prices" className="space-y-4 scroll-mt-24">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                <Bed className="size-6 text-primary" /> 
                {type === 'hotel' || type === 'resort' ? 'Available Rooms' : 'Property Details'}
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                {type === 'hotel' || type === 'resort' ? (
                  rooms.map((room: any) => (
                    <Card key={room._id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 rounded-xl p-4 md:p-6">
                      <div className="flex flex-col md:flex-row h-full gap-6 relative">
                        {selectedRoomsList.some(r => r.room._id === room._id) && (
                          <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                            <CheckSquare className="size-3" /> Selected
                          </div>
                        )}
                        <div className="w-full md:w-2/5 h-56 md:h-auto relative bg-gray-100 group cursor-pointer rounded-xl overflow-hidden shrink-0" onClick={() => openRoomModal(room)}>
                          {room.images && room.images.length > 0 ? (
                            <Image src={room.images[0]} alt={room.roomType} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                          )}
                          {room.images && room.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                              1 / {room.images.length}
                            </div>
                          )}
                        </div>
                        <CardContent className="p-0 flex flex-col justify-between flex-1">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <h3 className="font-bold text-2xl text-gray-900">{room.name || room.roomType}</h3>
                              <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 whitespace-nowrap">
                                <span className="flex items-center gap-1"><Bed className="size-3" /> {room.capacity} Guests</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1"><CheckSquare className="size-4" /> {room.roomType}</span>
                              <span className="text-gray-300">•</span>
                              <span>
                                {availability ? Math.max(0, room.count - (availability.bookedRooms[room._id] || 0)) : room.count} room(s) available
                                {availability && availability.bookedRooms[room._id] > 0 && <span className="text-orange-500 text-xs ml-1 font-bold">({availability.bookedRooms[room._id]} booked)</span>}
                              </span>
                              {room.amenities && room.amenities.length > 0 && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span>{room.amenities.length} amenities</span>
                                </>
                              )}
                            </div>
                            
                            {/* Short preview of amenities if any */}
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {room.amenities.slice(0, 3).map((a: any) => (
                                  <span key={a._id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md capitalize">{a.name.replace(/_/g, ' ')}</span>
                                ))}
                                {room.amenities.length > 3 && <span className="text-xs text-gray-500 px-1 py-1">+{room.amenities.length - 3} more</span>}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-6 mt-6 border-t gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-bold mb-1 tracking-wider">Price per night</p>
                              <div className="flex items-baseline gap-2">
                                <p className="font-extrabold text-3xl text-gray-900">৳ {room.publishedRate.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex w-full sm:w-auto gap-3">
                              <Button variant="outline" className="flex-1 sm:flex-none font-semibold border-gray-300 text-gray-700" onClick={() => openRoomModal(room)}>
                                Details
                              </Button>
                              {selectedRoomsList.some(r => r.room._id === room._id) ? (
                                <Button 
                                  variant="destructive"
                                  className="flex-1 sm:flex-none font-bold shadow-sm"
                                  onClick={() => removeSelectedRoom(room._id)}
                                >
                                  Remove
                                </Button>
                              ) : !session ? (
                                <Button 
                                  variant="secondary"
                                  className="flex-1 sm:flex-none font-bold shadow-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
                                  onClick={() => setIsLoginModalOpen(true)}
                                >
                                  Login to select
                                </Button>
                              ) : availability && Math.max(0, room.count - (availability.bookedRooms[room._id] || 0)) === 0 ? (
                                <Button 
                                  disabled
                                  className="flex-1 sm:flex-none bg-gray-200 text-gray-500 font-bold shadow-sm cursor-not-allowed"
                                >
                                  Sold Out
                                </Button>
                              ) : (
                                <Button 
                                  className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white font-bold shadow-sm"
                                  onClick={() => openBookingModal(room)}
                                >
                                  Select
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="overflow-hidden shadow-sm border-0">
                    <CardContent className="p-6 md:p-8 space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                          <Bed className="size-6 text-primary mb-2" />
                          <p className="font-bold text-xl text-gray-800">{propertyDetails?.bedrooms || 0}</p>
                          <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Bedrooms</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                          <div className="size-6 text-primary mb-2 flex items-center justify-center font-bold font-serif text-lg">B</div>
                          <p className="font-bold text-xl text-gray-800">{propertyDetails?.bathrooms || 0}</p>
                          <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Bathrooms</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                          <div className="size-6 text-primary mb-2 flex items-center justify-center font-bold"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 pos0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                          <p className="font-bold text-xl text-gray-800">{propertyDetails?.maxOccupancy || 0}</p>
                          <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Max Guests</p>
                        </div>
                        {type === 'villa' ? (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                            <Home className="size-6 text-primary mb-2" />
                            <p className="font-bold text-xl text-gray-800">{propertyDetails?.indoorArea || 0}</p>
                            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Sq Ft Area</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                            <Building2 className="size-6 text-primary mb-2" />
                            <p className="font-bold text-xl text-gray-800">{propertyDetails?.floorArea || 0}</p>
                            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Sq Ft (Fl {propertyDetails?.floorLevel || 1})</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {(type === 'hotel' || type === 'resort') && rooms.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-white">
                    No rooms currently available for booking at this property.
                  </div>
                )}
              </div>
            </div>

            {/* Amenities Section */}
            <Card id="facilities" className="border-0 shadow-sm scroll-mt-24">
              <CardHeader className="p-6 md:p-8 pb-0">
                <CardTitle className="text-2xl flex items-center gap-2"><CheckSquare className="size-6 text-primary" /> Amenities</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                  {amenities.filter((a: any) => a.isEnabled).map((amenity: any) => (
                    <div key={amenity._id} className="flex items-center gap-2 text-gray-700">
                      <div className="size-2 bg-primary rounded-full" />
                      <span className="capitalize font-medium">{amenity.name.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                  {amenities.filter((a: any) => a.isEnabled).length === 0 && <span className="text-muted-foreground col-span-full">No amenities listed.</span>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Policies & Contact */}
          <div className="space-y-6 lg:sticky lg:top-8 self-start">
            {/* Book Now Card */}
            <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl border-t-4 border-t-primary">
              <CardContent className="p-6">
                {type === 'villa' || type === 'apartment' ? (
                  <>
                    <div className="mb-6 space-y-4">
                      <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 mb-4 flex items-center gap-2 text-sm font-semibold">
                        <CheckSquare className="size-4" /> {type === 'villa' ? 'Villa' : 'Apartment'} Selected
                      </div>
                      
                      <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Stay Dates</label>
                        <DateRangePicker
                          checkIn={singlePropCheckIn}
                          checkOut={singlePropCheckOut}
                          onSelectRange={(inDate, outDate) => {
                            setSinglePropCheckIn(inDate);
                            setSinglePropCheckOut(outDate);
                          }}
                        />
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500 uppercase font-bold mb-1 tracking-wide">Base Price</p>
                        <p className="text-3xl font-extrabold text-gray-900">
                          ৳ {propertyDetails?.basePrice?.toLocaleString() || 'N/A'}
                          <span className="text-base font-normal text-gray-500"> / night</span>
                        </p>
                      </div>
                    </div>
                    {availability?.isSinglePropertyBooked ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg font-bold text-center mb-4 border border-red-100">
                            Property is not available for these dates.
                        </div>
                    ) : (
                        <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-md hover:shadow-lg transition-all rounded-lg"
                        onClick={proceedToCheckout}
                        >
                        Confirm Booking
                        </Button>
                    )}
                  </>
                ) : selectedRoomsList.length > 0 ? (
                  <>
                    <div className="mb-6 space-y-4">
                      <p className="text-sm text-gray-500 uppercase font-bold mb-1 tracking-wide">Selected Rooms</p>
                      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                        {selectedRoomsList.map((sel, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                            <div className="flex justify-between font-bold text-gray-800 mb-1">
                              <span>{sel.noOfRooms}x {sel.room.name || sel.room.roomType}</span>
                              <span>৳ {sel.totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="text-gray-500 text-xs flex justify-between">
                              <span>{sel.nights} night(s)</span>
                              <span>({sel.checkIn} to {sel.checkOut})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500 uppercase font-bold mb-1 tracking-wide">Total Price</p>
                        <p className="text-3xl font-extrabold text-gray-900">
                          ৳ {selectedRoomsList.reduce((acc, curr) => acc + curr.totalPrice, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-md hover:shadow-lg transition-all rounded-lg"
                      onClick={proceedToCheckout}
                    >
                      Confirm Booking
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 uppercase font-bold mb-1 tracking-wide">Starting from</p>
                      <p className="text-3xl font-extrabold text-gray-900">
                        {rooms.length > 0 ? `৳ ${Math.min(...rooms.map((r: any) => r.publishedRate)).toLocaleString()}` : 'N/A'}
                        <span className="text-base font-normal text-gray-500"> / night</span>
                      </p>
                    </div>
                    <Button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-6 text-lg shadow-sm rounded-lg cursor-not-allowed">
                      Select a room
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card id="policies" className="border-0 shadow-sm rounded-xl scroll-mt-24">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-xl flex items-center gap-2"><FileText className="size-5 text-primary" /> Good to know</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-blue-50 p-2 rounded text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block text-sm">Check-in</span>
                    <p className="text-gray-600 text-sm mt-1">{info.policies?.checkinTime || 'From 14:00'}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-blue-50 p-2 rounded text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block text-sm">Check-out</span>
                    <p className="text-gray-600 text-sm mt-1">{info.policies?.checkoutTime || 'Prior to 12:00'}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <span className="font-bold text-gray-800 block text-sm mb-2">Cancellation Policy</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{info.policies?.cancellationPolicy || 'Cancellation and prepayment policies vary according to accommodation type. Please check the conditions when selecting your option.'}</p>
                </div>

                <div className="border-t pt-6">
                  <span className="font-bold text-gray-800 block text-sm mb-3">Accepted Payment Methods</span>
                  <div className="flex flex-wrap gap-2">
                    {info.policies?.paymentMethods && info.policies.paymentMethods.map((pm: string) => (
                      <span key={pm} className="text-xs bg-gray-100 text-gray-700 font-medium px-3 py-1.5 rounded-full capitalize shadow-sm">{pm.replace(/_/g, ' ')}</span>
                    ))}
                    {(!info.policies?.paymentMethods || info.policies.paymentMethods.length === 0) && (
                      <span className="text-sm text-gray-500">No specific methods listed</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-primary text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4"><Phone className="size-5" /> Need Assistance?</h3>
                <p className="text-sm text-white/80 mb-4">Have questions about this property? Contact them directly.</p>
                <div className="space-y-2 text-sm font-medium">
                  {info.contact?.phone !== 'N/A' && <p>📞 {info.contact.phone}</p>}
                  {info.contact?.email !== 'N/A' && <p>✉️ {info.contact.email}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }} className="absolute top-6 right-6 text-white/70 hover:text-white z-[101] transition-colors bg-black/40 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1)); }} 
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 z-[101] bg-black/40 hover:bg-black/60 rounded-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          <div className="relative w-full max-w-6xl h-[85vh] flex items-center justify-center px-16" onClick={(e) => e.stopPropagation()}>
            <Image src={allImages[currentImageIndex] as string} alt={`Gallery Image ${currentImageIndex + 1}`} fill className="object-contain" priority />
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1)); }} 
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 z-[101] bg-black/40 hover:bg-black/60 rounded-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-sm font-medium bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      {/* Room Details Modal */}
      {isRoomModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsRoomModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedRoom.name || selectedRoom.roomType}</h2>
              <button onClick={() => setIsRoomModalOpen(false)} className="text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-4 md:p-8 space-y-8">
              
              {/* Top: Carousel */}
              <div className="max-w-3xl mx-auto space-y-4 w-full">
                <div className="relative h-64 md:h-[400px] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                  {selectedRoom.images && selectedRoom.images.length > 0 ? (
                    <>
                      <Image src={selectedRoom.images[roomImageIndex]} alt={selectedRoom.roomType} fill className="object-cover" />
                      
                      {selectedRoom.images.length > 1 && (
                        <>
                          <button 
                            onClick={() => setRoomImageIndex((prev) => (prev === 0 ? selectedRoom.images.length - 1 : prev - 1))} 
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                          </button>
                          <button 
                            onClick={() => setRoomImageIndex((prev) => (prev === selectedRoom.images.length - 1 ? 0 : prev + 1))} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </button>
                          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-md font-medium tracking-wide">
                            {roomImageIndex + 1} / {selectedRoom.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium">No Images Available</div>
                  )}
                </div>
                
                {/* Thumbnails */}
                {selectedRoom.images && selectedRoom.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar justify-center">
                    {selectedRoom.images.map((img: string, idx: number) => (
                      <div 
                        key={idx} 
                        onClick={() => setRoomImageIndex(idx)}
                        className={`relative h-20 w-28 rounded-xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all shadow-sm ${roomImageIndex === idx ? 'border-primary opacity-100 ring-2 ring-primary/20 ring-offset-1' : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'}`}
                      >
                        <Image src={img} alt="thumbnail" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Bottom: Details */}
              <div className="max-w-3xl mx-auto space-y-8 w-full pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">Room Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Capacity</p>
                      <p className="text-base font-semibold flex items-center gap-2 text-gray-800"><Bed className="size-4 text-primary" /> {selectedRoom.capacity} Guests</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Room Type</p>
                      <p className="text-base font-semibold flex items-center gap-2 text-gray-800"><CheckSquare className="size-4 text-primary" /> {selectedRoom.roomType}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2 md:col-span-1 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Availability</p>
                      <p className="text-base font-semibold text-gray-800">{selectedRoom.count} room(s) left</p>
                    </div>
                  </div>
                </div>
                
                {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">Room Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                      {selectedRoom.amenities.map((a: any) => (
                        <div key={a._id} className="flex items-center gap-3 text-gray-700 bg-white p-2 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                          <div className="size-8 bg-blue-50/50 rounded-full flex items-center justify-center shrink-0 border border-blue-100">
                            <CheckSquare className="size-4 text-primary" />
                          </div>
                          <span className="capitalize font-medium text-sm">{a.name.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!selectedRoom.amenities || selectedRoom.amenities.length === 0) && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">Room Amenities</h3>
                    <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-xl border border-gray-100">No specific room amenities listed.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 md:p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Price per night</p>
                <p className="font-bold text-2xl text-gray-900">৳ {selectedRoom.publishedRate.toLocaleString()}</p>
              </div>
              <div className="flex w-full sm:w-auto gap-3">
                <Button variant="outline" className="flex-1 sm:flex-none border-gray-300" onClick={() => setIsRoomModalOpen(false)}>
                  Close
                </Button>
                {selectedRoomsList.some(r => r.room._id === selectedRoom._id) ? (
                  <Button 
                    variant="destructive"
                    className="flex-1 sm:flex-none font-bold shadow-sm"
                    onClick={() => removeSelectedRoom(selectedRoom._id)}
                  >
                    Remove Selection
                  </Button>
                ) : !session ? (
                  <Button 
                    variant="secondary"
                    className="flex-1 sm:flex-none font-bold shadow-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Login to select
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white font-bold shadow-sm"
                    onClick={() => openBookingModal(selectedRoom)}
                  >
                    Select Room
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Booking Modal */}
      {isBookingModalOpen && bookingRoom && (
        <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsBookingModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 md:p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Book {bookingRoom.name || bookingRoom.roomType}</h2>
              <p className="text-sm text-gray-500 mt-1">Please select your dates and number of rooms.</p>
            </div>
            
            <div className="p-4 md:p-6 space-y-4">
              {bookingError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm font-medium">
                  {bookingError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Available</p>
                  <p className="font-semibold text-gray-900">{bookingRoom.count} Rooms</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Capacity</p>
                  <p className="font-semibold text-gray-900">{bookingRoom.capacity} Guests / Room</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Price per night</p>
                  <p className="font-semibold text-gray-900">৳ {bookingRoom.publishedRate.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Dates of Stay</label>
                  <DateRangePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onSelectRange={(inDate, outDate) => {
                      setCheckIn(inDate);
                      setCheckOut(outDate);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Number of Rooms</label>
                  <input 
                    type="number" 
                    min="1"
                    max={bookingRoom.count}
                    value={noOfRooms}
                    onChange={(e) => setNoOfRooms(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 md:p-6 border-t bg-gray-50 flex gap-3">
              <Button variant="outline" className="flex-1 border-gray-300" onClick={() => setIsBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold shadow-sm" onClick={confirmBookingSelection}>
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[130] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 md:p-6 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sign In Required</h2>
                <p className="text-sm text-gray-500 mt-1">Please log in to continue booking.</p>
              </div>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-gray-500 hover:text-gray-900 bg-gray-200 p-2 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <Input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full focus-visible:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <Input 
                  type="password" 
                  required
                  placeholder="******"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full focus-visible:ring-primary"
                />
              </div>
              
              <div className="pt-4">
                <Button type="submit" disabled={isLoginPending} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 shadow-sm rounded-lg">
                  {isLoginPending ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
