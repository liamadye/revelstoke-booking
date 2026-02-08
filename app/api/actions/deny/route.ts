import { NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/notion';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return new NextResponse('Missing ID', { status: 400 });
    }

    try {
        // Update Notion
        await updateBookingStatus(id, 'Denied');

        // We don't necessarily send a denial email automatically, 
        // to give the owner a chance to write a personal note if they prefer.
        // Or we could add it. For now, keep it simple.

        return new NextResponse(`
            <html>
                <head>
                    <style>
                        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #fcfaf8; color: #1c1917; }
                        .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
                        h1 { color: #dc2626; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Booking Denied</h1>
                        <p>The status has been updated to Denied in Notion.</p>
                        <p>No email has been sent to the guest automatically.</p>
                        <p>You can close this window.</p>
                    </div>
                </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' },
        });
    } catch (error) {
        console.error('Denial Error:', error);
        return new NextResponse('Failed to deny booking. Check logs.', { status: 500 });
    }
}
