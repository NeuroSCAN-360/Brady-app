import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://192.168.0.51/download');
    if (!response.ok) {
      return NextResponse.json(
        { error: 'CSV not available from device' },
        { status: 404 }
      );
    }
    const csvText = await response.text();
    return new NextResponse(csvText, {
      headers: {
        'Content-Type': 'text/csv',
      },
    });
  } catch (error) {
    console.error('Failed to fetch CSV from device:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CSV from device' },
      { status: 500 }
    );
  }
}
