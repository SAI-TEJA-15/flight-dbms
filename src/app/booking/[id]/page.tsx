"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plane, User, CreditCard, Check, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
}

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const flightId = params.id as string;
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Form data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [seatNumber, setSeatNumber] = useState("");

  useEffect(() => {
    fetchFlight();
  }, [flightId]);

  const fetchFlight = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/flights/${flightId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch flight");
      }
      
      setFlight(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // First, create or find passenger
      let passengerId: number;
      
      // Try to create passenger
      const passengerResponse = await fetch("/api/passengers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          passportNumber: passportNumber.toUpperCase(),
          dateOfBirth,
        }),
      });

      if (passengerResponse.ok) {
        const passenger = await passengerResponse.json();
        passengerId = passenger.id;
      } else {
        const errorData = await passengerResponse.json();
        
        // If passenger exists, try to find them by email
        if (errorData.code === "DUPLICATE_EMAIL" || errorData.code === "DUPLICATE_PASSPORT_NUMBER") {
          const existingResponse = await fetch(`/api/passengers?search=${email}`);
          const existingPassengers = await existingResponse.json();
          
          if (existingPassengers.length > 0) {
            passengerId = existingPassengers[0].id;
          } else {
            throw new Error("Failed to create or find passenger");
          }
        } else {
          throw new Error(errorData.error || "Failed to create passenger");
        }
      }

      // Create booking
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId: parseInt(flightId),
          passengerId,
          seatNumber: seatNumber.toUpperCase(),
          totalPrice: flight!.price,
          status: "confirmed",
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingData.error || "Failed to create booking");
      }

      toast.success("Booking confirmed!", {
        description: `Your booking reference is ${bookingData.bookingReference}`,
      });

      // Redirect to bookings page
      setTimeout(() => {
        router.push("/bookings");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Booking failed", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !flight) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                Flight not found
              </h2>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <Button asChild>
                <Link href="/flights">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Flights
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/flights" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Flights
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Booking</h1>
            <p className="text-gray-600 dark:text-gray-400">Enter passenger details to confirm your reservation</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Passenger Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Passenger Information
                    </CardTitle>
                    <CardDescription>Enter the passenger details as shown on passport</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          placeholder="John"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="+1-555-0123"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="passportNumber">Passport Number *</Label>
                        <Input
                          id="passportNumber"
                          value={passportNumber}
                          onChange={(e) => setPassportNumber(e.target.value)}
                          required
                          placeholder="US123456789"
                          maxLength={20}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seat Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Seat Selection
                    </CardTitle>
                    <CardDescription>Choose your preferred seat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="seatNumber">Seat Number *</Label>
                      <Input
                        id="seatNumber"
                        value={seatNumber}
                        onChange={(e) => setSeatNumber(e.target.value)}
                        required
                        placeholder="12A"
                        maxLength={4}
                        pattern="[0-9]+[A-Za-z]"
                      />
                      <p className="text-sm text-gray-500">
                        Format: Row number followed by letter (e.g., 12A, 23F)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Flight Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Flight Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {flight && (
                    <>
                      <div className="flex items-center gap-2 pb-4 border-b">
                        <Plane className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-bold">{flight.flightNumber}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {flight.airline}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">From</span>
                          <span className="font-semibold">{flight.origin}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">To</span>
                          <span className="font-semibold">{flight.destination}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Departure</span>
                          <span className="font-semibold">
                            {new Date(flight.departureTime).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Arrival</span>
                          <span className="font-semibold">
                            {new Date(flight.arrivalTime).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total</span>
                          <span className="text-2xl font-bold text-blue-600">
                            ${flight.price}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
