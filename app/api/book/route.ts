import { NextResponse } from 'next/server';
import { createBooking, checkAvailability } from '@/lib/notion';
import { sendBookingNotification } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, startDate, endDate, notes } = body;

        // Basic validation
        if (!name || !email || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check availability
        const isAvailable = await checkAvailability(start, end);
        if (!isAvailable) {
            return NextResponse.json(
                { error: 'Dates are not available' },
                { status: 409 }
            );
        }

        // Create Booking in Notion
        await createBooking({
            name,
            email,
            startDate: start,
            endDate: end,
            notes,
        });

        // Send Emails
        try {
            await sendBookingNotification({
                name,
                email,
                startDate: start,
                endDate: end,
                notes,
            });
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Continue even if email fails, but log it.
            // In a real app we might want to alert admin separately.
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
