import { NextResponse } from 'next/server';
import { stopStream } from '@/lib/websocket-manager';

export async function POST() {
  try {
    stopStream();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to stop stream:', error);
    return NextResponse.json(
      { error: 'Failed to stop stream' },
      { status: 500 }
    );
  }
}
