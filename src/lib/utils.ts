import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateImageUrl = (imageData: string): string => {
  // Generate a unique filename based on date and time
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  
  // Create a hash of the image data for uniqueness
  const hash = Array.from(imageData)
    .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
    .toString(36)
    .slice(-6);
  
  // Construct the URL-friendly path
  const path = `/images/${timestamp}-${hash}`;
  return path;
};

export const parseImageUrl = (url: string) => {
  const parts = url.split('-');
  if (parts.length < 2) return null;

  const hash = parts.pop();
  const timestamp = parts.join('-').replace('/images/', '');
  
  return {
    timestamp: new Date(timestamp.replace(/-/g, ':')),
    hash,
  };
};
