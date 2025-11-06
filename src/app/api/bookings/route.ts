import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, flights, passengers } from '@/db/schema';
import { eq, like, and } from 'drizzle-orm';

// Helper function to generate unique booking reference
function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let reference = 'BK';
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return reference;
}

// Helper function to validate seat number format
function isValidSeatNumber(seatNumber: string): boolean {
  const seatPattern = /^\d+[A-Z]$/;
  return seatPattern.test(seatNumber);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single booking by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const booking = await db.select()
        .from(bookings)
        .where(eq(bookings.id, parseInt(id)))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json({ 
          error: 'Booking not found',
          code: "BOOKING_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(booking[0]);
    }

    // List bookings with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const passengerId = searchParams.get('passengerId');
    const flightId = searchParams.get('flightId');
    const search = searchParams.get('search');

    let query = db.select().from(bookings);

    // Build filter conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(bookings.status, status));
    }

    if (passengerId) {
      const passengerIdNum = parseInt(passengerId);
      if (!isNaN(passengerIdNum)) {
        conditions.push(eq(bookings.passengerId, passengerIdNum));
      }
    }

    if (flightId) {
      const flightIdNum = parseInt(flightId);
      if (!isNaN(flightIdNum)) {
        conditions.push(eq(bookings.flightId, flightIdNum));
      }
    }

    if (search) {
      conditions.push(like(bookings.bookingReference, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId, passengerId, seatNumber, totalPrice, status } = body;

    // Validate required fields
    if (!flightId) {
      return NextResponse.json({ 
        error: "flightId is required",
        code: "MISSING_FLIGHT_ID" 
      }, { status: 400 });
    }

    if (!passengerId) {
      return NextResponse.json({ 
        error: "passengerId is required",
        code: "MISSING_PASSENGER_ID" 
      }, { status: 400 });
    }

    if (!seatNumber) {
      return NextResponse.json({ 
        error: "seatNumber is required",
        code: "MISSING_SEAT_NUMBER" 
      }, { status: 400 });
    }

    if (totalPrice === undefined || totalPrice === null) {
      return NextResponse.json({ 
        error: "totalPrice is required",
        code: "MISSING_TOTAL_PRICE" 
      }, { status: 400 });
    }

    // Validate field types and formats
    if (isNaN(parseInt(flightId))) {
      return NextResponse.json({ 
        error: "flightId must be a valid integer",
        code: "INVALID_FLIGHT_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(passengerId))) {
      return NextResponse.json({ 
        error: "passengerId must be a valid integer",
        code: "INVALID_PASSENGER_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(totalPrice)) || parseInt(totalPrice) <= 0) {
      return NextResponse.json({ 
        error: "totalPrice must be a positive integer",
        code: "INVALID_TOTAL_PRICE" 
      }, { status: 400 });
    }

    // Validate seat number format
    if (!isValidSeatNumber(seatNumber.trim().toUpperCase())) {
      return NextResponse.json({ 
        error: "seatNumber must be in format: digits followed by a letter (e.g., 12A)",
        code: "INVALID_SEAT_NUMBER" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ 
        error: "status must be one of: pending, confirmed, cancelled",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Check if flight exists
    const flight = await db.select()
      .from(flights)
      .where(eq(flights.id, parseInt(flightId)))
      .limit(1);

    if (flight.length === 0) {
      return NextResponse.json({ 
        error: 'Flight not found',
        code: "FLIGHT_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if passenger exists
    const passenger = await db.select()
      .from(passengers)
      .where(eq(passengers.id, parseInt(passengerId)))
      .limit(1);

    if (passenger.length === 0) {
      return NextResponse.json({ 
        error: 'Passenger not found',
        code: "PASSENGER_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if flight has available seats
    if (flight[0].availableSeats <= 0) {
      return NextResponse.json({ 
        error: 'No available seats on this flight',
        code: "NO_AVAILABLE_SEATS" 
      }, { status: 409 });
    }

    // Generate unique booking reference
    let bookingReference = generateBookingReference();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const existing = await db.select()
        .from(bookings)
        .where(eq(bookings.bookingReference, bookingReference))
        .limit(1);

      if (existing.length === 0) {
        isUnique = true;
      } else {
        bookingReference = generateBookingReference();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json({ 
        error: 'Failed to generate unique booking reference',
        code: "BOOKING_REFERENCE_GENERATION_FAILED" 
      }, { status: 500 });
    }

    const now = new Date().toISOString();

    // Create booking
    const newBooking = await db.insert(bookings)
      .values({
        flightId: parseInt(flightId),
        passengerId: parseInt(passengerId),
        bookingReference,
        seatNumber: seatNumber.trim().toUpperCase(),
        bookingDate: now,
        status: status || 'pending',
        totalPrice: parseInt(totalPrice),
        createdAt: now,
        updatedAt: now
      })
      .returning();

    // Decrement available seats
    await db.update(flights)
      .set({
        availableSeats: flight[0].availableSeats - 1,
        updatedAt: now
      })
      .where(eq(flights.id, parseInt(flightId)));

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}