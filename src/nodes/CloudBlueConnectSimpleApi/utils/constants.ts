/**
 * @file Global Constants
 * @description Defines global constants used throughout the CloudBlue Connect Simple API integration.
 * Currently includes:
 * - Pagination settings and limits
 *
 * @module CloudBlueConnectSimpleApi/utils/constants
 */

// Pagination constants, max limit is not enforced by the API, however assuming 100 is a safe limit
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 500,
} as const;

// Preset date options for date picker
export const presetDateOptions = [
  { name: 'Today', value: 'today' },
  { name: 'Yesterday', value: 'yesterday' },
  { name: '2 Days Ago', value: '2daysAgo' },
  { name: '3 Days Ago', value: '3daysAgo' },
  { name: '4 Days Ago', value: '4daysAgo' },
  { name: '5 Days Ago', value: '5daysAgo' },
  { name: '6 Days Ago', value: '6daysAgo' },
  { name: '1 Week Ago', value: '1weekAgo' },
  { name: '2 Weeks Ago', value: '2weeksAgo' },
  { name: '3 Weeks Ago', value: '3weeksAgo' },
  { name: '1 Month Ago', value: '1monthAgo' },
  { name: '2 Months Ago', value: '2monthsAgo' },
  { name: '3 Months Ago', value: '3monthsAgo' },
  { name: '6 Months Ago', value: '6monthsAgo' },
  { name: '9 Months Ago', value: '9monthsAgo' },
  { name: '1 Year Ago', value: '1yearAgo' },
  { name: 'Tomorrow', value: 'tomorrow' },
  { name: 'In 2 Days', value: 'in2days' },
  { name: 'In 3 Days', value: 'in3days' },
  { name: 'In 4 Days', value: 'in4days' },
  { name: 'In 5 Days', value: 'in5days' },
  { name: 'In 6 Days', value: 'in6days' },
  { name: 'In 1 Week', value: 'in1week' },
  { name: 'In 2 Weeks', value: 'in2weeks' },
  { name: 'In 3 Weeks', value: 'in3weeks' },
  { name: 'In 1 Month', value: 'in1month' },
  { name: 'In 2 Months', value: 'in2months' },
  { name: 'In 3 Months', value: 'in3months' },
  { name: 'In 6 Months', value: 'in6months' },
  { name: 'In 9 Months', value: 'in9months' },
  { name: 'In 1 Year', value: 'in1year' },
];
