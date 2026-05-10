import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDistance(x: number, y: number): string {
  const units = Math.sqrt(x * x + y * y);
  const distanceInKm = units * 3450.5; // Arbitrary sci-fi scale: 1 unit = 3450.5 km

  if (distanceInKm === 0) return "0 m";
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  if (distanceInKm >= 1000000) {
    return `${(distanceInKm / 1000000).toFixed(2)}M km`;
  }
  return `${distanceInKm.toLocaleString('en-US', { maximumFractionDigits: 1 })} km`;
}

export function getNumericDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}
