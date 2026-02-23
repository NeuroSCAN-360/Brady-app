import { NextResponse } from 'next/server';
import { resumeStream } from '@/lib/websocket-manager';

export async function POST() {
  try {
    resumeStream();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to start stream:', error);
    return NextResponse.json(
      { error: 'Failed to start stream' },
      { status: 500 }
    );
  }
}
