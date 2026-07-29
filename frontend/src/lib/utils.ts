import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getPreviewText(content: string, maxLength = 120): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "No content";
  }

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength)}…`
    : normalized;
}
