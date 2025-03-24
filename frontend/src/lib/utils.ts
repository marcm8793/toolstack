import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateToolSlug(id: string, name: string): string {
  // Normalize the name part of the slug
  const normalizedName = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars except whitespace and dash
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-") // Replace multiple dashes with single dash
    .trim(); // Trim leading/trailing whitespace

  return `${id}-${normalizedName}`;
}

/**
 * Extracts the tool ID from a slug
 * @param slug The full slug string
 * @returns The tool ID portion
 */
export function getToolIdFromSlug(slug: string): string {
  return slug.split("-")[0];
}
