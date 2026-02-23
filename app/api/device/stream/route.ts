import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://192.168.0.51:81/stream');
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Camera stream not available from device' },
        { status: 404 }
      );
    }
    
    // Get the content type from the device
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Stream the response
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Failed to fetch camera stream from device:', error);
    return NextResponse.json(
      { error: 'Failed to fetch camera stream from device' },
      { status: 500 }
    );
  }
}
