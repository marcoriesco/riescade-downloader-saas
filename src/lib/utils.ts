/**
 * Utility functions for the application
 */

/**
 * Format a date string into a human-readable format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatDate(date: string | null): string {
  if (!date) return "Sem data";

  return new Date(date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
