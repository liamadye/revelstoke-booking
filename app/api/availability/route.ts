import { NextResponse } from 'next/server';
import { getBlockedDates } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const blockedDates = await getBlockedDates();
        return NextResponse.json(blockedDates);
    } catch (error) {
        console.error('Availability check failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch availability' },
            { status: 500 }
        );
    }
}
