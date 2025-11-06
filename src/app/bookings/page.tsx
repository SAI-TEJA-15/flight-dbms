"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, User, CreditCard, Trash2, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Booking {
  id: number;
  flightId: number;
  passengerId: number;
  bookingReference: string;
  seatNumber: string;
  bookingDate: string;
  status: string;
  totalPrice: number;
}

interface Flight {
  id: number;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
}

interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface EnrichedBooking extends Booking {
  flight?: Flight;
  passenger?: Passenger;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/bookings");
      const bookingsData = await response.json();
      
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      // Fetch flight and passenger details for each booking
      const enrichedBookings = await Promise.all(
        bookingsData.map(async (booking: Booking) => {
          try {
            const [flightRes, passengerRes] = await Promise.all([
              fetch(`/api/flights/${booking.flightId}`),
              fetch(`/api/passengers?id=${booking.passengerId}`),
            ]);

            const flight = flightRes.ok ? await flightRes.json() : null;
            const passenger = passengerRes.ok ? await passengerRes.json() : null;

            return {
              ...booking,
              flight,
              passenger,
            };
          } catch {
            return booking;
          }
        })
      );

      setBookings(enrichedBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number, bookingRef: string) => {
    setCancellingId(bookingId);
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel booking");
      }

      toast.success("Booking cancelled", {
        description: `Booking ${bookingRef} has been cancelled successfully`,
      });

      // Refresh bookings
      fetchBookings();
    } catch (err) {
      toast.error("Cancellation failed", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your flight reservations</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            <AlertCircle className="inline-block mr-2 h-5 w-5" />
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plane className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start your journey by booking a flight
              </p>
              <Button asChild>
                <Link href="/flights">
                  <Plane className="mr-2 h-4 w-4" />
                  Search Flights
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600">{booking.bookingReference}</span>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    
                    {booking.status !== "cancelled" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel booking {booking.bookingReference}? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No, keep it</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelBooking(booking.id, booking.bookingReference)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Yes, cancel booking
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Flight Details */}
                    {booking.flight && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Plane className="w-4 h-4" />
                          <span>Flight Details</span>
                        </div>
                        <div>
                          <div className="font-semibold">{booking.flight.flightNumber}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {booking.flight.airline}
                          </div>
                          <div className="text-sm font-medium mt-1">
                            {booking.flight.origin} → {booking.flight.destination}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Travel Date */}
                    {booking.flight && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Travel Date</span>
                        </div>
                        <div>
                          <div className="font-semibold">
                            {new Date(booking.flight.departureTime).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Departure: {new Date(booking.flight.departureTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Seat: {booking.seatNumber}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Passenger */}
                    {booking.passenger && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          <span>Passenger</span>
                        </div>
                        <div>
                          <div className="font-semibold">
                            {booking.passenger.firstName} {booking.passenger.lastName}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {booking.passenger.email}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CreditCard className="w-4 h-4" />
                        <span>Total Price</span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${booking.totalPrice}
                        </div>
                      </div>
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
