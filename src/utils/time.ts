export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w ago`;
  return new Date(iso).toLocaleDateString();
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Buckets a list of items with an `updatedAt` ISO string into Today /
 * Yesterday / Earlier this week / Older groups, preserving input order
 * within each bucket. Used by the sidebar's conversation history.
 */
export function groupByDate<T extends { updatedAt: string }>(items: T[]): { label: string; items: T[] }[] {
  const today = startOfDay(new Date());
  const yesterday = today - 86_400_000;
  const weekAgo = today - 6 * 86_400_000;

  const buckets: Record<string, T[]> = { Today: [], Yesterday: [], 'This week': [], Earlier: [] };

  for (const item of items) {
    const day = startOfDay(new Date(item.updatedAt));
    if (day === today) buckets.Today.push(item);
    else if (day === yesterday) buckets.Yesterday.push(item);
    else if (day >= weekAgo) buckets['This week'].push(item);
    else buckets.Earlier.push(item);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}