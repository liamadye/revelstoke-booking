import { NextResponse } from 'next/server';
import { updateBookingStatus, getBookingDetails } from '@/lib/notion';
import { sendApprovalConfirmation } from '@/lib/email';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return new NextResponse('Missing ID', { status: 400 });
    }

    try {
        // Update Notion
        await updateBookingStatus(id, 'Approved');

        // Fetch details to send formatted email
        const details = await getBookingDetails(id);

        // Send Confirmation Email
        await sendApprovalConfirmation(details.email, {
            name: details.name,
            start: details.startDate,
            end: details.endDate
        });

        return new NextResponse(`
            <html>
                <head>
                    <style>
                        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #fcfaf8; color: #1c1917; }
                        .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
                        h1 { color: #16a34a; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Booking Approved!</h1>
                        <p>The status has been updated to Approved in Notion.</p>
                        <p>The guest (${details.email}) has been notified.</p>
                        <p>You can close this window.</p>
                    </div>
                </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' },
        });
    } catch (error) {
        console.error('Approval Error:', error);
        return new NextResponse('Failed to approve booking. Check logs.', { status: 500 });
    }
}
