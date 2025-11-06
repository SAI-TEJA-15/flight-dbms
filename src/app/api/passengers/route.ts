import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { passengers } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

// Helper function to validate date format (YYYY-MM-DD)
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Helper function to validate alphanumeric
function isAlphanumeric(str: string): boolean {
  return /^[A-Z0-9]+$/.test(str);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Get single passenger by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const passenger = await db
        .select()
        .from(passengers)
        .where(eq(passengers.id, parseInt(id)))
        .limit(1);

      if (passenger.length === 0) {
        return NextResponse.json(
          { error: 'Passenger not found', code: 'PASSENGER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(passenger[0], { status: 200 });
    }

    // List passengers with optional search and pagination
    let query = db.select().from(passengers);

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        or(
          like(passengers.firstName, searchTerm),
          like(passengers.lastName, searchTerm),
          like(passengers.email, searchTerm)
        )
      ) as typeof query;
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, passportNumber, dateOfBirth } = body;

    // Validate required fields
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
      return NextResponse.json(
        { error: 'First name is required and must be at least 2 characters', code: 'INVALID_FIRST_NAME' },
        { status: 400 }
      );
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Last name is required and must be at least 2 characters', code: 'INVALID_LAST_NAME' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json(
        { error: 'Phone is required', code: 'MISSING_PHONE' },
        { status: 400 }
      );
    }

    if (!passportNumber || typeof passportNumber !== 'string' || passportNumber.trim().length === 0) {
      return NextResponse.json(
        { error: 'Passport number is required', code: 'MISSING_PASSPORT_NUMBER' },
        { status: 400 }
      );
    }

    if (!dateOfBirth || typeof dateOfBirth !== 'string') {
      return NextResponse.json(
        { error: 'Date of birth is required', code: 'MISSING_DATE_OF_BIRTH' },
        { status: 400 }
      );
    }

    if (!isValidDate(dateOfBirth)) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DD', code: 'INVALID_DATE_FORMAT' },
        { status: 400 }
      );
    }

    // Sanitize and format inputs
    const sanitizedFirstName = firstName.trim();
    const sanitizedLastName = lastName.trim();
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPhone = phone.trim();
    const sanitizedPassportNumber = passportNumber.trim().toUpperCase();

    // Validate passport number is alphanumeric
    if (!isAlphanumeric(sanitizedPassportNumber)) {
      return NextResponse.json(
        { error: 'Passport number must be alphanumeric', code: 'INVALID_PASSPORT_FORMAT' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingEmail = await db
      .select()
      .from(passengers)
      .where(eq(passengers.email, sanitizedEmail))
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      );
    }

    // Check for duplicate passport number
    const existingPassport = await db
      .select()
      .from(passengers)
      .where(eq(passengers.passportNumber, sanitizedPassportNumber))
      .limit(1);

    if (existingPassport.length > 0) {
      return NextResponse.json(
        { error: 'Passport number already exists', code: 'DUPLICATE_PASSPORT_NUMBER' },
        { status: 409 }
      );
    }

    // Create new passenger
    const now = new Date().toISOString();
    const newPassenger = await db
      .insert(passengers)
      .values({
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        passportNumber: sanitizedPassportNumber,
        dateOfBirth: dateOfBirth,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newPassenger[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}