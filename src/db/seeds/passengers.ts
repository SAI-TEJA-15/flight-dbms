import { db } from '@/db';
import { passengers } from '@/db/schema';

async function main() {
    const currentDate = new Date().toISOString();
    
    const samplePassengers = [
        {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@gmail.com',
            phone: '+1-555-0101',
            passportNumber: 'US123456789',
            dateOfBirth: '1989-03-15',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@yahoo.com',
            phone: '+1-555-0202',
            passportNumber: 'US234567890',
            dateOfBirth: '1985-07-22',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael.chen@outlook.com',
            phone: '+44-20-1234-5678',
            passportNumber: 'GB987654321',
            dateOfBirth: '1992-11-08',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'Emily',
            lastName: 'Rodriguez',
            email: 'emily.rodriguez@gmail.com',
            phone: '+1-555-0303',
            passportNumber: 'US345678901',
            dateOfBirth: '1978-05-14',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'David',
            lastName: 'Kim',
            email: 'david.kim@hotmail.com',
            phone: '+81-3-1234-5678',
            passportNumber: 'JP456789123',
            dateOfBirth: '1995-09-30',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'Maria',
            lastName: 'Garcia',
            email: 'maria.garcia@yahoo.com',
            phone: '+33-1-4567-8901',
            passportNumber: 'FR789456123',
            dateOfBirth: '1982-12-18',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'James',
            lastName: 'Wilson',
            email: 'james.wilson@outlook.com',
            phone: '+49-30-1234-5678',
            passportNumber: 'DE321654987',
            dateOfBirth: '1973-04-25',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'Lisa',
            lastName: 'Anderson',
            email: 'lisa.anderson@gmail.com',
            phone: '+44-20-9876-5432',
            passportNumber: 'GB876543210',
            dateOfBirth: '1987-08-11',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'Robert',
            lastName: 'Taylor',
            email: 'robert.taylor@hotmail.com',
            phone: '+81-3-9876-5432',
            passportNumber: 'JP654321987',
            dateOfBirth: '1969-02-07',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'Jennifer',
            lastName: 'Martinez',
            email: 'jennifer.martinez@yahoo.com',
            phone: '+33-1-9876-5432',
            passportNumber: 'FR456123789',
            dateOfBirth: '1991-06-19',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'William',
            lastName: 'Brown',
            email: 'william.brown@gmail.com',
            phone: '+49-30-9876-5432',
            passportNumber: 'DE987321654',
            dateOfBirth: '1976-10-03',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
        {
            firstName: 'Jessica',
            lastName: 'Davis',
            email: 'jessica.davis@outlook.com',
            phone: '+1-604-555-0404',
            passportNumber: 'CA789012345',
            dateOfBirth: '1984-01-28',
            createdAt: currentDate,
            updatedAt: currentDate,
        },
    ];

    await db.insert(passengers).values(samplePassengers);
    
    console.log('✅ Passengers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});