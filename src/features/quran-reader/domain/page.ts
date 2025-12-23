import { TOTAL_PAGES } from "@/shared/constants/quran";

export function clampPage(
  input: number,
  totalPages: number = TOTAL_PAGES,
): number {
  if (!Number.isFinite(input)) return 1;
  const n = Math.trunc(input);
  return Math.max(1, Math.min(totalPages, n));
}

export function parsePageParam(
  param: unknown,
  totalPages: number = TOTAL_PAGES,
): number {
  if (typeof param !== "string") return 1;
  return clampPage(Number(param.trim()), totalPages);
}
