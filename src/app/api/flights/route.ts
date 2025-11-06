import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { flights } from '@/db/schema';
import { eq, like, or, and, gte, sql, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single flight by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID' 
          },
          { status: 400 }
        );
      }

      const flight = await db.select()
        .from(flights)
        .where(eq(flights.id, parseInt(id)))
        .limit(1);

      if (flight.length === 0) {
        return NextResponse.json(
          { 
            error: 'Flight not found',
            code: 'FLIGHT_NOT_FOUND' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json(flight[0], { status: 200 });
    }

    // List flights with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const origin = searchParams.get('origin')?.toUpperCase().trim();
    const destination = searchParams.get('destination')?.toUpperCase().trim();
    const date = searchParams.get('date');
    const passengers = searchParams.get('passengers');

    // Validate query parameters
    if (limit < 0 || offset < 0) {
      return NextResponse.json(
        { 
          error: 'Limit and offset must be non-negative',
          code: 'INVALID_PAGINATION' 
        },
        { status: 400 }
      );
    }

    if (origin && origin.length !== 3) {
      return NextResponse.json(
        { 
          error: 'Origin must be a 3-letter IATA airport code',
          code: 'INVALID_ORIGIN' 
        },
        { status: 400 }
      );
    }

    if (destination && destination.length !== 3) {
      return NextResponse.json(
        { 
          error: 'Destination must be a 3-letter IATA airport code',
          code: 'INVALID_DESTINATION' 
        },
        { status: 400 }
      );
    }

    if (date && isNaN(Date.parse(date))) {
      return NextResponse.json(
        { 
          error: 'Date must be a valid date string (YYYY-MM-DD)',
          code: 'INVALID_DATE' 
        },
        { status: 400 }
      );
    }

    if (passengers && (isNaN(parseInt(passengers)) || parseInt(passengers) < 1)) {
      return NextResponse.json(
        { 
          error: 'Passengers must be a positive integer',
          code: 'INVALID_PASSENGERS' 
        },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [];

    // Search condition
    if (search) {
      conditions.push(
        or(
          like(flights.flightNumber, `%${search}%`),
          like(flights.airline, `%${search}%`)
        )
      );
    }

    // Origin filter
    if (origin) {
      conditions.push(eq(flights.origin, origin));
    }

    // Destination filter
    if (destination) {
      conditions.push(eq(flights.destination, destination));
    }

    // Date filter (match departure date only)
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();
      
      conditions.push(
        and(
          gte(flights.departureTime, startOfDay),
          sql`${flights.departureTime} <= ${endOfDay}`
        )
      );
    }

    // Available seats filter
    if (passengers) {
      conditions.push(gte(flights.availableSeats, parseInt(passengers)));
    }

    // Execute query
    let query = db.select().from(flights);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count for pagination
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(flights);
    
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }

    const [{ count: total }] = await countQuery;

    // Get paginated results sorted by departure time
    const results = await query
      .orderBy(asc(flights.departureTime))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      flights: results,
      total,
      limit,
      offset
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }
}