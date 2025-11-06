import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, flights } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (booking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, seatNumber } = body;

    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: 'Invalid status. Must be one of: pending, confirmed, cancelled',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
    }

    // Validate seatNumber format if provided
    if (seatNumber !== undefined) {
      const seatPattern = /^\d+[A-Z]$/;
      if (!seatPattern.test(seatNumber)) {
        return NextResponse.json(
          {
            error: 'Invalid seat number format. Must be digits followed by a letter (e.g., 12A)',
            code: 'INVALID_SEAT_NUMBER',
          },
          { status: 400 }
        );
      }
    }

    // Check if status is changing to cancelled
    const previousStatus = existingBooking[0].status;
    const isBeingCancelled = status === 'cancelled' && previousStatus !== 'cancelled';

    // If booking is being cancelled, increment flight's availableSeats
    if (isBeingCancelled) {
      const flightId = existingBooking[0].flightId;
      
      const flight = await db
        .select()
        .from(flights)
        .where(eq(flights.id, flightId))
        .limit(1);

      if (flight.length > 0) {
        await db
          .update(flights)
          .set({
            availableSeats: flight[0].availableSeats + 1,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(flights.id, flightId));
      }
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (status !== undefined) {
      updates.status = status;
    }

    if (seatNumber !== undefined) {
      updates.seatNumber = seatNumber;
    }

    // Update booking
    const updated = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update booking', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const flightId = existingBooking[0].flightId;

    // Increment flight's availableSeats before deleting
    const flight = await db
      .select()
      .from(flights)
      .where(eq(flights.id, flightId))
      .limit(1);

    if (flight.length > 0) {
      await db
        .update(flights)
        .set({
          availableSeats: flight[0].availableSeats + 1,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(flights.id, flightId));
    }

    // Delete booking
    const deleted = await db
      .delete(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete booking', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Booking cancelled successfully',
        bookingId: parseInt(id),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}