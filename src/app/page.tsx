"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Calendar, Users, Search, Ticket, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.append("origin", origin);
    if (destination) params.append("destination", destination);
    if (date) params.append("date", date);
    if (passengers) params.append("passengers", passengers);
    
    router.push(`/flights?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">SkyBook</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/flights">
                  <Search className="mr-2 h-4 w-4" />
                  Search Flights
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/bookings">
                  <Ticket className="mr-2 h-4 w-4" />
                  My Bookings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Your Journey Starts Here
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Book flights to destinations worldwide with ease. Fast, reliable, and affordable.
          </p>
        </div>

        {/* Quick Search Widget */}
        <Card className="max-w-5xl mx-auto shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Find Your Perfect Flight</CardTitle>
            <CardDescription>Search for flights to your dream destination</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    From
                  </label>
                  <Input
                    placeholder="Origin (e.g., JFK)"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    maxLength={3}
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Plane className="w-4 h-4 text-gray-500" />
                    To
                  </label>
                  <Input
                    placeholder="Destination (e.g., LHR)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    maxLength={3}
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Passengers
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="text-lg"
                  />
                </div>
              </div>
              
              <Button type="submit" size="lg" className="w-full text-lg h-14">
                <Search className="mr-2 h-5 w-5" />
                Search Flights
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Choose SkyBook?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>Easy Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Find the perfect flight with our intuitive search filters and real-time availability
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle>Instant Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Book your tickets instantly with our streamlined reservation process
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle>Manage Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                View, modify, and cancel your reservations anytime from your account
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Popular Destinations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { code: "LHR", city: "London", country: "United Kingdom" },
            { code: "NRT", city: "Tokyo", country: "Japan" },
            { code: "CDG", city: "Paris", country: "France" },
            { code: "DXB", city: "Dubai", country: "UAE" },
          ].map((dest) => (
            <Card key={dest.code} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">{dest.code}</CardTitle>
                <CardDescription className="text-lg">{dest.city}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">{dest.country}</p>
                <Button variant="link" className="px-0 mt-2" asChild>
                  <Link href={`/flights?destination=${dest.code}`}>
                    View Flights →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Ready to Take Off?</CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Start planning your next adventure today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/flights">
                  <Search className="mr-2 h-5 w-5" />
                  Search Flights
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/bookings">
                  <Ticket className="mr-2 h-5 w-5" />
                  View Bookings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Plane className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">SkyBook</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 SkyBook Flight Booking System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}