import { NextRequest, NextResponse } from 'next/server';

let lastQuarterlyUpdate: number | null = null;
const QUARTERLY_THROTTLE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export async function POST(request: NextRequest) {
  const nowMs = Date.now();
  if (lastQuarterlyUpdate && nowMs - lastQuarterlyUpdate < QUARTERLY_THROTTLE_MS) {
    return NextResponse.json({ message: 'Quarterly update throttled: Please wait before updating again.' }, { status: 429 });
  }
  lastQuarterlyUpdate = nowMs;
  // TODO: Implement quarterly update logic
  return NextResponse.json({ message: 'Quarterly stock update endpoint hit. (Not yet implemented)' });
} 