/**
 * @file Filter Interfaces
 * @description Common filter interfaces used across the application
 *
 * @module CloudBlueConnectSimpleApi/interfaces/filters
 */

export interface IDateFilter {
  presetDate?: { preset: string };
  datePicker?: { date: string };
}
