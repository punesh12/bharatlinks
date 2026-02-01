import { format } from "date-fns";

/**
 * Format a date to "MMM d, yyyy" format (e.g., "Jan 25, 2026")
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy");
};

/**
 * Format a date to "MMM d, yyyy 'at' h:mm a" format (e.g., "Jan 25, 2026 at 2:30 PM")
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
};

/**
 * Calculate the reset date (first day of next month)
 * The usage count automatically resets on this date because getMonthlyLinkCount()
 * filters links by createdAt >= startOfMonth, which changes on the 1st of each month
 */
export const getResetDate = (): Date => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
};

/**
 * Get the next billing date (first day of next month)
 */
export const getNextBillingDate = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

/**
 * Get the next reset date (same as getResetDate, alias for consistency)
 */
export const getNextResetDate = (): Date => {
  return getResetDate();
};
