import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Add flights table
export const flights = sqliteTable('flights', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  flightNumber: text('flight_number').notNull().unique(),
  airline: text('airline').notNull(),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  departureTime: text('departure_time').notNull(),
  arrivalTime: text('arrival_time').notNull(),
  price: integer('price').notNull(),
  availableSeats: integer('available_seats').notNull(),
  totalSeats: integer('total_seats').notNull(),
  status: text('status').notNull().default('scheduled'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add passengers table
export const passengers = sqliteTable('passengers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  passportNumber: text('passport_number').notNull().unique(),
  dateOfBirth: text('date_of_birth').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add bookings table
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  flightId: integer('flight_id').notNull().references(() => flights.id),
  passengerId: integer('passenger_id').notNull().references(() => passengers.id),
  bookingReference: text('booking_reference').notNull().unique(),
  seatNumber: text('seat_number').notNull(),
  bookingDate: text('booking_date').notNull(),
  status: text('status').notNull().default('pending'),
  totalPrice: integer('total_price').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});