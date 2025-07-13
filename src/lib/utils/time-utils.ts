// src/lib/utils/time-utils.ts
// Time formatting and relative time utilities

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return targetDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatLastUpdated(date: Date | string | null): string {
  if (!date) return 'Never updated';
  
  const targetDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // If less than 5 minutes, show as "Live"
  if (diffMinutes < 5) {
    return 'Live';
  }
  
  return formatRelativeTime(targetDate);
}

export function formatTimeWithSeconds(date: Date | string | null): string {
  if (!date) return 'Unknown';
  
  const targetDate = new Date(date);
  return targetDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return 'Unknown';
  
  const targetDate = new Date(date);
  return targetDate.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function isDataFresh(date: Date | string | null, maxMinutes: number = 5): boolean {
  if (!date) return false;
  
  const targetDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  return diffMinutes <= maxMinutes;
}

export function getDataFreshnessLevel(date: Date | string | null): 'live' | 'recent' | 'stale' | 'unknown' {
  if (!date) return 'unknown';
  
  const targetDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes <= 5) return 'live';
  if (diffMinutes <= 60) return 'recent';
  return 'stale';
}

export function getFreshnessColor(level: 'live' | 'recent' | 'stale' | 'unknown'): string {
  switch (level) {
    case 'live': return 'text-green-600';
    case 'recent': return 'text-yellow-600';
    case 'stale': return 'text-red-600';
    case 'unknown': return 'text-gray-600';
    default: return 'text-gray-600';
  }
}

export function getFreshnessIcon(level: 'live' | 'recent' | 'stale' | 'unknown'): string {
  switch (level) {
    case 'live': return '●';
    case 'recent': return '●';
    case 'stale': return '●';
    case 'unknown': return '●';
    default: return '●';
  }
} 