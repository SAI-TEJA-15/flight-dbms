"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Calendar, Users, Search, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Flight {
  id: number;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  status: string;
}

function FlightsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search filters
  const [origin, setOrigin] = useState(searchParams.get("origin") || "");
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [passengers, setPassengers] = useState(searchParams.get("passengers") || "1");

  const fetchFlights = async () => {
    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams();
      if (origin) params.append("origin", origin.toUpperCase());
      if (destination) params.append("destination", destination.toUpperCase());
      if (date) params.append("date", date);
      if (passengers) params.append("passengers", passengers);
      
      const response = await fetch(`/api/flights?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch flights");
      }
      
      setFlights(data.flights || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights();
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Search Flights</h1>
          <p className="text-gray-600 dark:text-gray-400">Find the perfect flight for your journey</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Flight Search</CardTitle>
            <CardDescription>Enter your travel details to find available flights</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Origin</label>
                <div className="relative">
                  <Plane className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="JFK"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="pl-10"
                    maxLength={3}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination</label>
                <div className="relative">
                  <Plane className="absolute left-3 top-3 h-4 w-4 text-gray-400 rotate-90" />
                  <Input
                    placeholder="LHR"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10"
                    maxLength={3}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Passengers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium invisible">Search</label>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Flight Results */}
        {!loading && flights.length === 0 && (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No flights found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria
            </p>
          </div>
        )}

        {!loading && flights.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Available Flights ({flights.length})
            </h2>
            
            {flights.map((flight) => (
              <Card key={flight.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                    {/* Flight Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-blue-600">{flight.flightNumber}</span>
                        <span className="text-gray-600 dark:text-gray-400">{flight.airline}</span>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatTime(flight.departureTime)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {flight.origin}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(flight.departureTime)}
                          </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-xs text-gray-500 mb-1">
                            {calculateDuration(flight.departureTime, flight.arrivalTime)}
                          </div>
                          <div className="w-full h-px bg-gray-300 dark:bg-gray-600 relative">
                            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 bg-white dark:bg-gray-800 rotate-90" />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Direct</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatTime(flight.arrivalTime)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {flight.destination}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(flight.arrivalTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Availability */}
                    <div className="text-center lg:text-left">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Available Seats
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {flight.availableSeats} / {flight.totalSeats}
                      </div>
                      {flight.availableSeats < 10 && flight.availableSeats > 0 && (
                        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          Only {flight.availableSeats} seats left!
                        </div>
                      )}
                      {flight.availableSeats === 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Fully booked
                        </div>
                      )}
                    </div>
                    
                    {/* Price & Book */}
                    <div className="flex flex-col items-center lg:items-end gap-3">
                      <div className="text-center lg:text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">From</div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${flight.price}
                        </div>
                        <div className="text-xs text-gray-500">per person</div>
                      </div>
                      
                      <Button
                        asChild
                        size="lg"
                        disabled={flight.availableSeats === 0}
                        className="w-full lg:w-auto"
                      >
                        <Link href={`/booking/${flight.id}`}>
                          Book Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <div className="text-xl text-gray-900 dark:text-white">Loading flights...</div>
        </div>
      </div>
    }>
      <FlightsContent />
    </Suspense>
  );
}
