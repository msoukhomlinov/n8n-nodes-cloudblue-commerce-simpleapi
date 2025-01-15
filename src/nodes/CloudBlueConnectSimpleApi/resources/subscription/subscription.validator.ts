import type { IDataObject } from 'n8n-workflow';
import type { ISubscription } from './subscription.types';
import { SubscriptionStatus } from './subscription.types';
import { debugLog } from '../../utils/debug';

export async function validateSubscriptionUpdate(params: unknown): Promise<boolean> {
  debugLog('RESOURCE_EXEC', 'Validating subscription update parameters', { params });

  if (!isDataObject(params)) {
    debugLog('RESOURCE_EXEC', 'Invalid params type - expected object', { type: typeof params });
    return false;
  }

  const { id, data } = params as { id: string; data: IDataObject };
  if (!id || !data) {
    debugLog('RESOURCE_EXEC', 'Missing id or data', { id, data });
    return false;
  }

  if (data.status && !isValidStatus(data.status as string)) {
    debugLog('RESOURCE_EXEC', 'Invalid status value', { status: data.status });
    return false;
  }

  return true;
}

export async function validateSubscriptionRead(params: unknown): Promise<boolean> {
  debugLog('RESOURCE_EXEC', 'Validating subscription read parameters', { params });

  if (!isDataObject(params)) {
    debugLog('RESOURCE_EXEC', 'Invalid params type - expected object', { type: typeof params });
    return false;
  }

  const isValid = typeof (params as IDataObject).id === 'string';
  if (!isValid) {
    debugLog('RESOURCE_EXEC', 'Invalid or missing id parameter', { params });
  }
  return isValid;
}

export async function validateSubscriptionList(params: unknown): Promise<boolean> {
  debugLog('RESOURCE_EXEC', 'Validating subscription list parameters', { params });

  if (!isDataObject(params)) {
    debugLog('RESOURCE_EXEC', 'Invalid params type - expected object', { type: typeof params });
    return false;
  }

  const validFilters = [
    'customerId',
    'creationDateFrom',
    'creationDateTo',
    'status',
    'offset',
    'limit',
  ];
  const isValid = Object.keys(params as IDataObject).every((key) => validFilters.includes(key));

  if (!isValid) {
    debugLog('RESOURCE_EXEC', 'Invalid filter keys found', {
      validFilters,
      providedFilters: Object.keys(params as IDataObject),
    });
  }

  return isValid;
}

// Helper functions
function isDataObject(value: unknown): value is IDataObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidStatus(status: string): boolean {
  const isValid = Object.values(SubscriptionStatus).includes(status as SubscriptionStatus);
  if (!isValid) {
    debugLog('RESOURCE_EXEC', 'Invalid status value', {
      providedStatus: status,
      validStatuses: Object.values(SubscriptionStatus),
    });
  }
  return isValid;
}
