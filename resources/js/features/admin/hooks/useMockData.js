import { useMemo } from 'react';

export function useMockData() {
  const data = useMemo(() => ({
    [],
    [],
    [],
    categories,
    [],
    [],
    schedule,
    [],
    [],
    [],
    videos,
    opinions,
    [],
    { labels: [], datasets: [] },
    categoryBreakdown,
    [],
    contentStatus,
    serverHealth,
    [],
    [],
    users,
  }), []);

  return data;
}
