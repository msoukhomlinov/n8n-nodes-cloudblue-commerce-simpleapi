export const DEBUG_CONFIG = {
  // API Communication
  API_REQUEST: true, // Debug API request details
  API_RESPONSE: true, // Debug API response details
  API_ERROR: true, // Debug API error details
  API_URL: true, // Debug URL construction

  // Resource Operations
  RESOURCE_INIT: true, // Debug resource initialization
  RESOURCE_EXEC: true, // Debug resource execution

  // Authentication
  AUTH_FLOW: true, // Debug authentication flow
  AUTH_REQUEST: true, // Debug authentication request
  AUTH_ERROR: true, // Debug authentication error
  AUTH_SUCCESS: true, // Debug authentication success

  // Cache
  CACHE_OPS: true, // Debug cache operations
};

export type DebugLogType =
  | 'API_REQUEST'
  | 'API_RESPONSE'
  | 'API_ERROR'
  | 'API_URL'
  | 'RESOURCE_INIT'
  | 'RESOURCE_EXEC'
  | 'AUTH_FLOW'
  | 'AUTH_REQUEST'
  | 'AUTH_ERROR'
  | 'AUTH_SUCCESS'
  | 'CACHE_OPS';

/**
 * Type guard to check if a value is a Record<string, unknown>
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * List of keys that should be redacted in debug output
 */
const SENSITIVE_KEYS = [
  'x-api-key',
  'apikey',
  'api_key',
  'password',
  'token',
  'secret',
  'authorization',
  'auth',
  'x-subscription-key',
  'client_secret',
  'client_id',
];

/**
 * Redact sensitive information from objects
 * @param obj Object to redact
 * @returns Redacted copy of the object
 */
export function redactSensitiveData(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item));
  }

  if (isRecord(obj)) {
    const redactedObj: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        redactedObj[key] = '[REDACTED]';
      } else {
        redactedObj[key] = typeof value === 'object' ? redactSensitiveData(value) : value;
      }
    }

    return redactedObj;
  }

  return obj;
}

/**
 * Debug logging function that automatically redacts sensitive data
 */
export const debugLog = (category: keyof typeof DEBUG_CONFIG, message: string, data?: unknown) => {
  if (DEBUG_CONFIG[category]) {
    console.log(`[DEBUG][${category}] ${message}`);
    if (data !== undefined) {
      const redactedData = redactSensitiveData(data);
      console.log(JSON.stringify(redactedData, null, 2));
    }
  }
};
