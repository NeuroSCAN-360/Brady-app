import { NextResponse } from 'next/server';
import { parse as parseCsvSync } from 'csv-parse/sync';

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (!text) {
      return NextResponse.json(
        { error: 'No CSV provided' },
        { status: 400 }
      );
    }

    const records = parseCsvSync(text.trim(), { columns: true, skip_empty_lines: true });
    let samples = records
      .map((r: any) => {
        const norm = Object.fromEntries(
          Object.entries(r).map(([k, v]) => [String(k).toLowerCase().replace(/[^a-z0-9]/g, ''), v])
        );
        const tStr =
          norm['timems'] ??
          norm['time'] ??
          norm['t'] ??
          norm['timestamp'] ??
          norm['ms'] ??
          '0';
        const fStr =
          norm['forcen'] ??
          norm['force'] ??
          norm['pressure'] ??
          norm['value'] ??
          norm['n'] ??
          '0';
        const t = parseFloat(tStr as string);
        const force = parseFloat(fStr as string);
        return Number.isFinite(t) && Number.isFinite(force) ? { t, force } : null;
      })
      .filter(Boolean);

    // Decimate to max 5000 points to reduce payload size
    const MAX_POINTS = 5000;
    if (samples.length > MAX_POINTS) {
      const stride = Math.ceil(samples.length / MAX_POINTS);
      const out: any[] = [];
      for (let i = 0; i < samples.length; i += stride) out.push(samples[i]);
      if (out[out.length - 1] !== samples[samples.length - 1]) out.push(samples[samples.length - 1]);
      samples = out;
    }

    const durationMs = samples.length ? samples[samples.length - 1].t - samples[0].t : 0;
    const forces = samples.map((s: any) => s.force);
    const nonZeroForces = forces.filter((f: number) => f > 0);
    const avgForce = nonZeroForces.length > 0 
      ? nonZeroForces.reduce((a: number, b: number) => a + b, 0) / nonZeroForces.length 
      : 0;
    const maxForce = samples.reduce((m: number, s: any) => Math.max(m, s.force), 0);
    const variability = Math.sqrt(
      forces.reduce((a: number, f: number) => a + Math.pow(f - avgForce, 2), 0) / Math.max(1, forces.length)
    );

    return NextResponse.json({ 
      samples, 
      metrics: { durationMs, avgForce, maxForce, variability } 
    });
  } catch (error) {
    console.error('CSV parse failed:', error);
    return NextResponse.json(
      { error: 'CSV parse failed', details: String(error) },
      { status: 400 }
    );
  }
}
