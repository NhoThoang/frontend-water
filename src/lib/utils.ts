import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  // In the browser
  if (typeof window !== 'undefined') {
    const host = window.location.origin;
    if (host.includes('localhost')) {
      return `http://localhost:9000/water-meter-images/${path}`;
    }
    // Production: Use relative path to avoid Mixed Content (HTTP vs HTTPS)
    return `/water-meter-images/${path}`;
  }

  // Server-side fallback
  return `http://localhost:9000/water-meter-images/${path}`;
}
