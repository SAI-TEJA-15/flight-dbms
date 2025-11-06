import { db } from '@/db';
import { bookings } from '@/db/schema';

async function main() {
    const now = new Date().toISOString();
    
    // Helper function to get date X days ago
    const getDaysAgo = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString();
    };

    const sampleBookings = [
        // Flight 1 (DL101) - $650 - 3 bookings
        {
            flightId: 1,
            passengerId: 1,
            bookingReference: 'BKAX7M2P',
            seatNumber: '12A',
            bookingDate: getDaysAgo(28),
            status: 'confirmed',
            totalPrice: 650,
            createdAt: now,
            updatedAt: now,
        },
        {
            flightId: 1,
            passengerId: 2,
            bookingReference: 'BK3J9K1L',
            seatNumber: '12B',
            bookingDate: getDaysAgo(25),
            status: 'confirmed',
            totalPrice: 650,
            createdAt: now,
            updatedAt: now,
        },
        {
            flightId: 1,
            passengerId: 3,
            bookingReference: 'BKQ5R8T2',
            seatNumber: '15C',
            bookingDate: getDaysAgo(3),
            status: 'pending',
            totalPrice: 650,
            createdAt: now,
            updatedAt: now,
        },
        
        // Flight 2 (JL202) - $850 - 2 bookings
        {
            flightId: 2,
            passengerId: 4,
            bookingReference: 'BKL9M4N7',
            seatNumber: '8B',
            bookingDate: getDaysAgo(22),
            status: 'confirmed',
            totalPrice: 850,
            createdAt: now,
            updatedAt: now,
        },
        {
            flightId: 2,
            passengerId: 5,
            bookingReference: 'BKP2W6X9',
            seatNumber: '19D',
            bookingDate: getDaysAgo(20),
            status: 'confirmed',
            totalPrice: 850,
            createdAt: now,
            updatedAt: now,
        },
        
        // Flight 3 (AF303) - $720 - 3 bookings
        {
            flightId: 3,
            passengerId: 6,
            bookingReference: 'BKT8V3Y1',
            seatNumber: '23F',
            bookingDate: getDaysAgo(18),
            status: 'confirmed',
            totalPrice: 720,
            createdAt: now,
            updatedAt: now,
        },
        {
            flightId: 3,
            passengerId: 7,
            bookingReference: 'BKH5N2M8',
            seatNumber: '23E',
            bookingDate: getDaysAgo(15),
            status: 'cancelled',
            totalPrice: 720,
            createdAt: now,
            updatedAt: now,
        },
        {
            flightId: 3,
            passengerId: 8,
            bookingReference: 'BKZ4K7P3',
            seatNumber: '27A',
            bookingDate: getDaysAgo(2),
            status: 'pending',
            totalPrice: 720,
            createdAt: now,
            updatedAt: now,
        },
        
        // Flight 4 (EK404) - $920 - 2 bookings
        {
            flightId: 4,
            passengerId: 9,
            bookingReference: 'BKR6S1Q9',
            seatNumber: '5F',
            bookingDate: getDaysAgo(14),
            status: 'confirmed',
            totalPrice: 920,
            createdAt: now,
            updatedAt: now,
        },
        {
            flightId: 4,
            passengerId: 10,
            bookingReference: 'BKF3D8W2',
            seatNumber: '5E',
            bookingDate: getDaysAgo(12),
            status: 'confirmed',
            totalPrice: 920,
            createdAt: now,
            updatedAt: now,
        },
        
        // Flight 5 (IB505) - $580 - 2 bookings
        {
            flightId: 5,
            passengerId: 11,
            bookingReference: 'BKG9B4V7',
            seatNumber: '31B',
            bookingDate: getDaysAgo(10),
            status: 'confirmed',
            totalPrice: 580,
            createdAt: now,
            updatedAt: now,
        },
        {
            flightId: 5,
            passengerId: 12,
            bookingReference: 'BKC7J2X5',
            seatNumber: '31C',
            bookingDate: getDaysAgo(8),
            status: 'confirmed',
            totalPrice: 580,
            createdAt: now,
            updatedAt: now,
        },
        
        // Flight 6 (SQ606) - $980 - 2 bookings
        {
            flightId: 6,
            passengerId: 1,
            bookingReference: 'BKM5T9L4',
            seatNumber: '2A',
            bookingDate: getDaysAgo(7),
            status: 'confirmed',
            totalPrice: 980,
            createdAt: now,
            updatedAt: now,
        },
        {
            flightId: 6,
            passengerId: 3,
            bookingReference: 'BKN8P6R1',
            seatNumber: '2B',
            bookingDate: getDaysAgo(5),
            status: 'cancelled',
            totalPrice: 980,
            createdAt: now,
            updatedAt: now,
        },
        
        // Flight 7 (KL707) - $670 - 2 bookings
        {
            flightId: 7,
            passengerId: 4,
            bookingReference: 'BKY3H7K9',
            seatNumber: '18C',
            bookingDate: getDaysAgo(6),
            status: 'confirmed',
            totalPrice: 670,
            createdAt: now,
            updatedAt: now,
        },
        {
            flightId: 7,
            passengerId: 6,
            bookingReference: 'BKW1Q4Z8',
            seatNumber: '18D',
            bookingDate: getDaysAgo(4),
            status: 'pending',
            totalPrice: 670,
            createdAt: now,
            updatedAt: now,
        },
        
        // Flight 8 (LH808) - $710 - 2 bookings
        {
            flightId: 8,
            passengerId: 7,
            bookingReference: 'BKV6X2N5',
            seatNumber: '25F',
            bookingDate: getDaysAgo(3),
            status: 'confirmed',
            totalPrice: 710,
            createdAt: now,
            updatedAt: now,
        },
        {
            flightId: 8,
            passengerId: 9,
            bookingReference: 'BKA4S8L3',
            seatNumber: '25E',
            bookingDate: getDaysAgo(1),
            status: 'pending',
            totalPrice: 710,
            createdAt: now,
            updatedAt: now,
        },
    ];

    await db.insert(bookings).values(sampleBookings);
    
    console.log('✅ Bookings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});