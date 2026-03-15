"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Country, Province, Ward } from "@/lib/types";
import { useState, useEffect, useMemo } from "react";
import {
  reverseGeocodeLocation,
  searchLocationSuggestions,
  getCountries,
  getProvinces,
  getWards,
  LocationLookupItem,
  CreateListingPayload,
} from "@/lib/api-client";
import MapPicker from "@/components/seller/create-listing/mapPicker";

interface Step1BasicInfoProps {
  data: CreateListingPayload;
  onChange: (field: string, value: string | number) => void;
}

const propertyTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "land", label: "Land" },
  { value: "office", label: "Office" },
  { value: "commercial", label: "Commercial" },
];

export function Step1BasicInfo({ data, onChange }: Step1BasicInfoProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [mapLat, setMapLat] = useState(data.latitude ?? 10.7769);
  const [mapLng, setMapLng] = useState(data.longitude ?? 106.7009);
  const [suggestions, setSuggestions] = useState<LocationLookupItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "granted" | "denied" | "unsupported"
  >("idle");

  //Get api
  useEffect(() => {
    getCountries().then(setCountries).catch(console.error);
  }, []);

  useEffect(() => {
    if (data.countryId) {
      getProvinces(data.countryId).then(setProvinces).catch(console.error);
    } else {
      setProvinces([]);
    }
  }, [data.countryId]);

  useEffect(() => {
    if (data.provinceId) {
      getWards(data.provinceId).then(setWards).catch(console.error);
    } else {
      setWards([]);
    }
  }, [data.provinceId]);

  useEffect(() => {
    // Keep map state in sync when form state changes externally.
    if (typeof data.latitude === "number" && typeof data.longitude === "number") {
      setMapLat(data.latitude);
      setMapLng(data.longitude);
    }
  }, [data.latitude, data.longitude]);

  const requestCurrentLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapLat(latitude);
        setMapLng(longitude);
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  useEffect(() => {
    if (typeof data.latitude === "number" && typeof data.longitude === "number") return;
    requestCurrentLocation();
    // Run once on mount to pick an initial center near the current user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //handle
  const handleCountryChange = (val: string) => {
    onChange("countryId", val);
    onChange("provinceId", "");
    onChange("wardId", "");
  };

  const handleProvinceChange = (val: string) => {
    onChange("provinceId", val);
    onChange("wardId", "");
  };

  const handleCounterChange = (field: string, delta: number) => {
    const currentValue = data[field as keyof typeof data] as number;
    const newValue = Math.max(0, Math.min(10, currentValue + delta));
    onChange(field, newValue);
  };

  const applyMapSelection = async () => {
    onChange("latitude", Number(mapLat.toFixed(6)));
    onChange("longitude", Number(mapLng.toFixed(6)));

    try {
      const reversed = await reverseGeocodeLocation(mapLat, mapLng);
      const nextAddress = reversed.normalizedAddress || reversed.streetAddress;
      if (nextAddress) {
        onChange("address", nextAddress);
        setLocationQuery(nextAddress);
      }
      if (reversed.country?.countryId) onChange("countryId", reversed.country.countryId);
      if (reversed.province?.provinceId) onChange("provinceId", reversed.province.provinceId);
      if (reversed.ward?.wardId) onChange("wardId", reversed.ward.wardId);
      setLookupError(null);
    } catch {
      setLookupError("Could not reverse-geocode this point. Coordinates are still applied.");
    }
  };

  useEffect(() => {
    const query = locationQuery.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    let mounted = true;
    const timeout = setTimeout(() => {
      setSearchLoading(true);
      searchLocationSuggestions({
        q: query,
        countryId: data.countryId || undefined,
        provinceId: data.provinceId || undefined,
        wardId: data.wardId || undefined,
        lat: mapLat,
        lng: mapLng,
        limit: 8,
      })
        .then((res) => {
          if (!mounted) return;
          setSuggestions(res.items || []);

          if (res.items?.length > 0) {
            // UX: typing recenters preview to top ranked match.
            setMapLat(res.items[0].lat);
            setMapLng(res.items[0].lng);
          }

          setLookupError(null);
        })
        .catch(() => {
          if (!mounted) return;
          setLookupError("Address lookup failed. Try again.");
          setSuggestions([]);
        })
        .finally(() => {
          if (mounted) setSearchLoading(false);
        });
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [locationQuery, data.countryId, data.provinceId, data.wardId, mapLat, mapLng]);

  const filteredMapOptions = useMemo(() => {
    return suggestions;
  }, [suggestions]);
  //Return

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Property Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 *:w-1/2 max-w-100">
            <Label htmlFor="propertyType">Select Property Type</Label>
            <Select
              value={data.propertyType}
              onValueChange={(value) => onChange("propertyType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Listing Type</Label>
            <RadioGroup
              value={data.listingType}
              onValueChange={(value) => onChange("transactionType", value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sale" id="sale" />
                <Label htmlFor="sale" className="font-normal cursor-pointer">
                  For Sale
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rent" id="rent" />
                <Label htmlFor="rent" className="font-normal cursor-pointer">
                  For Rent
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Modern 3-Bedroom Apartment in Downtown"
              value={data.title}
              onChange={(e) => onChange("title", e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {data.title.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your property in detail..."
              value={data.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={5}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {data.description.length}/5000 characters
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Structural Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                value={data.yearBuilt}
                onChange={(e) => onChange("yearBuilt", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floors</Label>
              <Input
                id="floor"
                type="number"
                value={data.floorNumber}
                onChange={(e) =>
                  onChange("floor", e.target.value ? Number(e.target.value) : 0)
                }
              />
            </div>
          </div>

          {/* <div className="space-y-4">
            <div className="space-y-2">
              <Label>Legal Status</Label>
              <Select value={data.legalStatus} onValueChange={(v) => onChange("legalStatus", v)}>
                <SelectTrigger><SelectValue placeholder="Ownership type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="red-book">Red Book (Vietnam Standard)</SelectItem>
                  <SelectItem value="pink-book">Pink Book</SelectItem>
                  <SelectItem value="contract">Sales Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Furniture</Label>
              <Select value={data.furnitureStatus} onValueChange={(v) => onChange("furnitureStatus", v)}>
                <SelectTrigger><SelectValue placeholder="Interior status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Fully Furnished</SelectItem>
                  <SelectItem value="basic">Basic Interior</SelectItem>
                  <SelectItem value="none">Raw / Empty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={data.countryId} onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.countryId} value={c.countryId}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Province / City</Label>
              <Select
                disabled={!data.countryId}
                value={data.provinceId}
                onValueChange={handleProvinceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.provinceId} value={p.provinceId}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ward / District</Label>
              <Select
                disabled={!data.provinceId}
                value={data.wardId}
                onValueChange={(val) => onChange("wardId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((w) => (
                    <SelectItem key={w.wardId} value={w.wardId}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              placeholder="e.g. 123 Nguyen Hue Street"
              value={data.streetAddress}
              onChange={(e) => onChange("address", e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-dashed p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-medium text-sm">Select from map</p>
                <p className="text-xs text-muted-foreground">
                  Pin the exact location. We try to initialize the map near your current location first.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={requestCurrentLocation}>
                <MapPin className="h-4 w-4 mr-1" /> Use Current Location
              </Button>
            </div>
            {locationStatus === "loading" && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Getting your current location...
              </p>
            )}
            {locationStatus === "denied" && (
              <p className="text-xs text-muted-foreground">
                Location permission was denied. Using fallback center.
              </p>
            )}
            {locationStatus === "unsupported" && (
              <p className="text-xs text-muted-foreground">
                Geolocation is not supported in this browser. Using fallback center.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Coordinates: {Number(data.latitude ?? mapLat).toFixed(6)}, {Number(data.longitude ?? mapLng).toFixed(6)}
            </p>

            <div className="space-y-2">
              <Label htmlFor="location-lookup">Address lookup</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location-lookup"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredMapOptions[0]) {
                      e.preventDefault();
                      const top = filteredMapOptions[0];
                      setMapLat(top.lat);
                      setMapLng(top.lng);
                      setLocationQuery(top.fullAddress || top.name);
                    }
                  }}
                  placeholder={searchLoading ? "Searching addresses..." : "Type address and map will locate..."}
                  className="pl-9"
                />
              </div>

              {!searchLoading && (
                <div className="max-h-48 overflow-y-auto rounded-md border divide-y">
                  {filteredMapOptions.length > 0 ? (
                    filteredMapOptions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full text-left p-3 hover:bg-muted transition-colors"
                        onClick={() => {
                          setMapLat(item.lat);
                          setMapLng(item.lng);
                          setLocationQuery(item.fullAddress || item.name);
                        }}
                      >
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.fullAddress}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-3">
                      {locationQuery.trim().length < 2
                        ? "Type at least 2 characters to search."
                        : "No location matches your search."}
                    </p>
                  )}
                </div>
              )}

              {searchLoading && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Searching addresses...
                </p>
              )}
              {lookupError && <p className="text-xs text-destructive">{lookupError}</p>}
            </div>

            <MapPicker
              lat={mapLat}
              lng={mapLng}
              onChange={(lat, lng) => {
                setMapLat(lat);
                setMapLng(lng);
              }}
            />

            <p className="text-xs text-muted-foreground">
              Selected point: {mapLat.toFixed(6)}, {mapLng.toFixed(6)}
            </p>

            <Button type="button" onClick={applyMapSelection}>
              Apply Selected Location
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price & Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Price (VND) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={data.price || ""}
                  onChange={(e) => onChange("price", Number(e.target.value))}
                  className="pl-7"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  đ
                </span>
              </div>
              {data.listingType === "rent" && (
                <p className="text-xs text-muted-foreground">per month</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">
                Area (sqm) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="area"
                  type="number"
                  placeholder="0"
                  value={data.areaSqm || ""}
                  onChange={(e) => onChange("area", Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  m²
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bedrooms</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCounterChange("bedrooms", -1)}
                  disabled={data.bedrooms <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium">
                  {data.bedrooms}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCounterChange("bedrooms", 1)}
                  disabled={data.bedrooms >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bathrooms</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCounterChange("bathrooms", -1)}
                  disabled={data.bathrooms <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium">
                  {data.bathrooms}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCounterChange("bathrooms", 1)}
                  disabled={data.bathrooms >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
