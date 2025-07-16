import { NextRequest, NextResponse } from 'next/server';

let lastDailyUpdate: number | null = null;
const DAILY_THROTTLE_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  const nowMs = Date.now();
  if (lastDailyUpdate && nowMs - lastDailyUpdate < DAILY_THROTTLE_MS) {
    return NextResponse.json({ message: 'Daily update throttled: Please wait before updating again.' }, { status: 429 });
  }
  lastDailyUpdate = nowMs;
  // TODO: Implement daily update logic
  return NextResponse.json({ message: 'Daily stock update endpoint hit. (Not yet implemented)' });
} 