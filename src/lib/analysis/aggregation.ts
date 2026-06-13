import type { FrequencyToken } from "@/types/analysis";

export function aggregateFrequency(values: string[], limit = 12): FrequencyToken[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    if (!value) {
      continue;
    }
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      count,
      percentage: total ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit);
}

export function dominantValue(values: FrequencyToken[], fallback = "Unknown") {
  return values[0]?.value ?? fallback;
}
