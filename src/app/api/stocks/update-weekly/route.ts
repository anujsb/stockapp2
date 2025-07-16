import { NextRequest, NextResponse } from 'next/server';

let lastWeeklyUpdate: number | null = null;
const WEEKLY_THROTTLE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(request: NextRequest) {
  const nowMs = Date.now();
  if (lastWeeklyUpdate && nowMs - lastWeeklyUpdate < WEEKLY_THROTTLE_MS) {
    return NextResponse.json({ message: 'Weekly update throttled: Please wait before updating again.' }, { status: 429 });
  }
  lastWeeklyUpdate = nowMs;
  // TODO: Implement weekly update logic
  return NextResponse.json({ message: 'Weekly stock update endpoint hit. (Not yet implemented)' });
} 