/**
 * @file Date Validator Utility
 * @description Provides validation functions for date-related operations.
 * Validates:
 * - Date filter structures
 * - Date formats
 * - Date ranges
 *
 * @module CloudBlueCommerceSimpleApi/utils/dateValidator
 */

import type { IDateFilter } from '../interfaces/filters';

const DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates a date string matches the date-time format (YYYY-MM-DDThh:mm:ssZ)
 */
export function validateDateTime(dateStr: string, fieldName: string): void {
  if (!DATE_TIME_REGEX.test(dateStr)) {
    throw new Error(`${fieldName} must be in ISO 8601 format (YYYY-MM-DDThh:mm:ssZ)`);
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`${fieldName} is not a valid date-time`);
  }
}

/**
 * Validates a date string matches the date format (YYYY-MM-DD)
 */
export function validateDate(dateStr: string, fieldName: string): void {
  if (!DATE_REGEX.test(dateStr)) {
    throw new Error(`${fieldName} must be in YYYY-MM-DD format`);
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`${fieldName} is not a valid date`);
  }
}

/**
 * Validates a date filter structure and its values
 */
export function validateDateFilter(
  filter: IDateFilter,
  fieldName: string,
  isDateTime = true,
): void {
  if (!filter) {
    throw new Error(`${fieldName} filter is required`);
  }

  if (filter.presetDate?.preset) {
    // Preset date validation is handled by the date converter
    return;
  }

  if (filter.datePicker?.date) {
    try {
      if (isDateTime) {
        validateDateTime(filter.datePicker.date, fieldName);
      } else {
        validateDate(filter.datePicker.date, fieldName);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Invalid date format for ${fieldName}: ${error.message}`);
      }
      throw new Error(`Invalid date format for ${fieldName}`);
    }
  } else {
    throw new Error(`${fieldName} must have either a preset date or a picked date`);
  }
}

/**
 * Formats a date to the API's date-time format
 */
export function formatToDateTime(date: Date): string {
  return date.toISOString().split('.')[0] + 'Z';
}

/**
 * Formats a date to the API's date format
 */
export function formatToDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
