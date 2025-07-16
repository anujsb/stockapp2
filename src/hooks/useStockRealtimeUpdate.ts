import { useEffect, useRef, useState } from 'react';
import { isDataStale } from '@/lib/utils/portfolio-utils';

interface UseStockRealtimeUpdateOptions {
  userPresent: boolean; // true if user is logged in and present
  lastRefreshed?: string | Date | null;
  enableRealtime?: boolean;
  enableDaily?: boolean;
  enableWeekly?: boolean;
  enableQuarterly?: boolean;
}

interface UseStockRealtimeUpdateResult {
  isUpdating: boolean;
  lastUpdateTime: Date | null;
  error: string | null;
}

/**
 * Custom hook to trigger stock data updates based on user presence and staleness.
 * - Triggers real-time update every 1 min while user is present and tab is active
 * - Triggers daily/weekly/quarterly update if data is stale on login
 * - Exposes update status for UI feedback
 */
export function useStockRealtimeUpdate({
  userPresent,
  lastRefreshed,
  enableRealtime = true,
  enableDaily = true,
  enableWeekly = true,
  enableQuarterly = true,
}: UseStockRealtimeUpdateOptions): UseStockRealtimeUpdateResult {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detect tab visibility and window focus
  useEffect(() => {
    const handleVisibility = () => {
      setIsActive(document.visibilityState === 'visible' && document.hasFocus());
    };
    const handleFocus = () => setIsActive(true);
    const handleBlur = () => setIsActive(false);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    handleVisibility();
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Helper to call the update endpoint
  const updateStocks = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch('/api/stocks/update-all', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Update failed');
      } else {
        setLastUpdateTime(new Date());
      }
    } catch (e: any) {
      setError(e?.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  // On login or when user becomes present, check for staleness and trigger updates
  useEffect(() => {
    if (!userPresent || !isActive) return;
    // Real-time update immediately
    if (enableRealtime) updateStocks();
    // Daily update if stale
    if (enableDaily && isDataStale(lastRefreshed, 'daily')) updateStocks();
    // Weekly update if stale
    if (enableWeekly && isDataStale(lastRefreshed, 'weekly')) updateStocks();
    // Quarterly update if stale
    if (enableQuarterly && isDataStale(lastRefreshed, 'quarterly')) updateStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPresent, isActive]);

  // While user is present and tab is active, set up 1-min interval for real-time updates
  useEffect(() => {
    if (!userPresent || !enableRealtime || !isActive) return;
    intervalRef.current = setInterval(updateStocks, 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPresent, enableRealtime, isActive]);

  return { isUpdating, lastUpdateTime, error };
} 