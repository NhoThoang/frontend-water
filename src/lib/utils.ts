import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // For development/local environment
  return `http://localhost:9000/water-meter-images/${path}`;
}
