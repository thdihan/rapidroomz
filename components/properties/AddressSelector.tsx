import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";
import { Loader2 } from "lucide-react";

interface Location {
  _id: string;
  name: string;
  code?: string;
}

interface AddressSelectorProps {
  fieldErrors?: Record<string, string>;
  initialData?: any;
}

export default function AddressSelector({ fieldErrors = {}, initialData }: AddressSelectorProps) {
  const [countries, setCountries] = useState<Location[]>([]);
  const [states, setStates] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/location/countries`);
        const result = await res.json();
        if (result.success) setCountries(result.data);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (initialData) {
      if (initialData.country) setSelectedCountry(initialData.country);
      if (initialData.state) setSelectedState(initialData.state);
      if (initialData.city) setSelectedCity(initialData.city);
    }
  }, [initialData]);

  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      setCities([]);
      setSelectedState("");
      setSelectedCity("");
      return;
    }

    const fetchStatesAndCities = async () => {
      setLoadingStates(true);
      setLoadingCities(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        // Get country ID matching the name
        const countryObj = countries.find(c => c.name === selectedCountry);
        if (!countryObj) return;

        const stateRes = await fetch(`${apiUrl}/location/states?countryId=${countryObj._id}`);
        const stateResult = await stateRes.json();
        const stateList = stateResult.success ? stateResult.data : [];
        setStates(stateList);
        setLoadingStates(false);

        // If no states exist (like Bangladesh), fetch cities immediately for the country
        if (stateList.length === 0) {
          const cityRes = await fetch(`${apiUrl}/location/cities?countryId=${countryObj._id}`);
          const cityResult = await cityRes.json();
          if (cityResult.success) setCities(cityResult.data);
        } else {
          setCities([]); // Wait for state selection
        }
      } catch (err) {
        console.error("Failed to fetch states/cities", err);
      } finally {
        setLoadingStates(false);
        setLoadingCities(false);
      }
    };

    fetchStatesAndCities();
  }, [selectedCountry, countries]);

  useEffect(() => {
    if (!selectedState || states.length === 0) return;

    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const countryObj = countries.find(c => c.name === selectedCountry);
        const stateObj = states.find(s => s.name === selectedState);
        if (!countryObj || !stateObj) return;

        const cityRes = await fetch(`${apiUrl}/location/cities?countryId=${countryObj._id}&stateId=${stateObj._id}`);
        const cityResult = await cityRes.json();
        if (cityResult.success) setCities(cityResult.data);
      } catch (err) {
        console.error("Failed to fetch cities", err);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedState, states, selectedCountry, countries]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Hidden inputs to capture values for FormData */}
      <input type="hidden" name="country" value={selectedCountry} />
      <input type="hidden" name="state" value={selectedState} />
      <input type="hidden" name="city" value={selectedCity} />

      <div className="space-y-2">
        <Label>Country <span className="text-red-500">*</span></Label>
        <Combobox
          value={selectedCountry}
          onValueChange={(val) => {
            setSelectedCountry(val || "");
            setSelectedState("");
            setSelectedCity("");
          }}
        >
          <ComboboxInput placeholder="Select or search country..." className={`h-12 ${fieldErrors['address.country'] ? 'border-red-500' : ''}`} />
          <ComboboxContent>
            <ComboboxList>
              {countries.length === 0 && <ComboboxEmpty>No countries found</ComboboxEmpty>}
              {countries.map(c => (
                <ComboboxItem key={c._id} value={c.name}>
                  {c.name}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {fieldErrors['address.country'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['address.country']}</p>}
      </div>

      <div className="space-y-2">
        <Label>State / Region</Label>
        <Combobox
          value={selectedState}
          onValueChange={(val) => {
            setSelectedState(val || "");
            setSelectedCity("");
          }}
          disabled={!selectedCountry || states.length === 0}
        >
          <ComboboxInput placeholder={loadingStates ? "Loading..." : "Select or search state..."} className="h-12" />
          <ComboboxContent>
            <ComboboxList>
              {states.length === 0 && <ComboboxEmpty>No states available</ComboboxEmpty>}
              {states.map(s => (
                <ComboboxItem key={s._id} value={s.name}>
                  {s.name}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>City <span className="text-red-500">*</span></Label>
        <Combobox
          value={selectedCity}
          onValueChange={(val) => setSelectedCity(val || "")}
          disabled={!selectedCountry || (states.length > 0 && !selectedState)}
        >
          <ComboboxInput placeholder={loadingCities ? "Loading..." : "Select or search city..."} className={`h-12 ${fieldErrors['address.city'] ? 'border-red-500' : ''}`} />
          <ComboboxContent>
            <ComboboxList>
              {cities.length === 0 && <ComboboxEmpty>No cities available</ComboboxEmpty>}
              {cities.map(c => (
                <ComboboxItem key={c._id} value={c.name}>
                  {c.name}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {fieldErrors['address.city'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['address.city']}</p>}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="addressLine">Detailed Address <span className="text-red-500">*</span></Label>
        <Input name="addressLine" id="addressLine" defaultValue={initialData?.addressLine} placeholder="e.g. 123 Main Street, Suite 4B" required className={`h-12 ${fieldErrors['address.addressLine'] ? 'border-red-500' : ''}`} />
        {fieldErrors['address.addressLine'] && <p className="text-xs text-red-500 mt-1">{fieldErrors['address.addressLine']}</p>}
      </div>
    </div>
  );
}
