/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  createFormatter,
} from 'next-intl';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isCurrentUrl(path: string, isRoot: boolean = false): boolean {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    return isRoot ? currentPath.startsWith(path) : currentPath === path;
  }
  return false; // Fallback for server-side rendering
}

/**
 * Create formatting utilities for a specific locale
 * @param locale The locale to use for formatting (e.g., 'en', 'fr', 'de')
 * @param timeZone Optional time zone (defaults to user's system time zone)
 */
export function createFormatters(locale?: string, timeZone?: string) {
  // Create a formatter instance for the given locale
  const formatter = createFormatter({
    locale: locale || navigator.language || 'en-US',
    timeZone,
    // You can add your message dictionary here if needed
    onError: (error) => {
      console.warn('Formatting error:', error);
    }
  });

  return {

    /**
     * Format a currency value according to the locale
     * @param value The number to format
     * @param currency The currency code (e.g., 'USD', 'EUR')
     * @param options Additional Intl.NumberFormatOptions
     * @param useCompactNotation Whether to use compact notation for large numbers (e.g., 1M, 2.5B)
     */
    formatCurrency: (
      value: number,
      currency: string,
      options?: Omit<Intl.NumberFormatOptions, 'style' | 'currency'>,
      useCompactNotation?: boolean
    ) => {
      // For large numbers, use compact notation if requested
      if (useCompactNotation !== false && Math.abs(value) >= 1000000) {
        return formatter.number(value, {
          style: 'currency',
          currency,
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: 1,
          ...options as any
        });
      }
      
      // Default formatting for regular numbers
      return formatter.number(value, {
        style: 'currency',
        currency,
        minimumFractionDigits : 0,
        maximumFractionDigits : 2,
        ...options as any
      });
    },

    /**
     * Format a number as a percentage according to the locale
     * @param value The number to format (e.g., 0.25 for 25%)
     * @param options Additional Intl.NumberFormatOptions
     */
    formatPercentage: (
      value: number,
      options?: Omit<Intl.NumberFormatOptions, 'style'>
    ) => {
      return formatter.number(value, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...options as any
      });
    },



    // Return the current locale and timeZone
    locale,
    timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}