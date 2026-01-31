import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_KEY,
});


const formatUUID = (id: string) => {
  if (id.includes('-')) return id;
  return `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(12, 16)}-${id.substring(16, 20)}-${id.substring(20)}`;
};

const DATABASE_ID = process.env.NOTION_DATABASE_ID ? formatUUID(process.env.NOTION_DATABASE_ID) : undefined;

export interface Booking {
  name: string;
  email: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export const createBooking = async (booking: Booking) => {
  if (!DATABASE_ID) {
    throw new Error('NOTION_DATABASE_ID is not defined');
  }

  const response = await notion.pages.create({
    parent: {
      database_id: DATABASE_ID,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: booking.name,
            },
          },
        ],
      },
      Email: {
        email: booking.email,
      },
      Dates: {
        date: {
          start: booking.startDate.toISOString().split('T')[0],
          end: booking.endDate.toISOString().split('T')[0],
        },
      },
      Status: {
        select: {
          name: 'Pending',
        },
      },
      Note: {
        rich_text: [
          {
            text: {
              content: booking.notes || '',
            },
          },
        ],
      },
    },
  });

  return response;
};

export const checkAvailability = async (startDate: Date, endDate: Date) => {
  if (!DATABASE_ID) {
    throw new Error('NOTION_DATABASE_ID is not defined');
  }



  // Notion date filter is a bit tricky for overlaps. 
  // Let's refine the query or filter client side for better accuracy.
  // Query: Get all future active bookings, then check overlap.

  // Check availability
  // Check availability
  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
  const notionVersion = '2022-06-28';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_KEY}`,
      'Notion-Version': notionVersion,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        and: [
          {
            property: 'Status',
            select: {
              does_not_equal: 'Denied',
            },
          },
          {
            property: 'Dates',
            date: {
              after: new Date().toISOString(),
            },
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('DEBUG: Fetch failed:', response.status, errorText);
    throw new Error(`Notion API error: ${response.status} ${errorText}`);
  }

  const activeBookings = await response.json() as { results: any[] };

  const hasOverlap = activeBookings.results.some((page: any) => {
    const start = page.properties.Dates?.date?.start;
    const end = page.properties.Dates?.date?.end || start; // Single date fallback

    if (!start) return false;

    const existingStart = new Date(start);
    const existingEnd = new Date(end);

    return (
      startDate < existingEnd && endDate > existingStart
    );
  });

  return !hasOverlap;
};

export const getBlockedDates = async () => {
  if (!DATABASE_ID) {
    throw new Error('NOTION_DATABASE_ID is not defined');
  }

  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
  const notionVersion = '2022-06-28';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_KEY}`,
      'Notion-Version': notionVersion,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        and: [
          {
            property: 'Status',
            select: {
              does_not_equal: 'Denied',
            },
          },
          {
            property: 'Dates',
            date: {
              after: new Date().toISOString(),
            },
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status}`);
  }

  const data = await response.json() as { results: any[] };

  return data.results.map((page: any) => {
    return {
      start: page.properties.Dates?.date?.start,
      end: page.properties.Dates?.date?.end || page.properties.Dates?.date?.start,
    };
  }).filter(range => range.start); // Filter out invalid ranges
};
