/**
 * @file Customer Resource Validator
 * @description Validation functions for customer resource operations
 * Implements:
 * - Input validation for operations
 * - Type checking
 * - Required field validation
 *
 * @module CloudBlueConnectSimpleApi/resources/customer
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { debugLog } from '../../utils/debug';
import type { ICustomer, ICustomerFilters } from './customer.types';

export namespace CustomerValidator {
  /**
   * Validate create customer input
   */
  export function validateCreate(executeFunctions: IExecuteFunctions, i: number): ICustomer {
    debugLog('CUSTOMER_VALIDATE', 'Validating create customer input');

    const name = executeFunctions.getNodeParameter('name', i) as string;
    const type = executeFunctions.getNodeParameter('type', i) as 'person' | 'company';
    const contact = (
      executeFunctions.getNodeParameter('contact', i) as { value: ICustomer['contact'] }
    ).value;
    const address = (
      executeFunctions.getNodeParameter('address', i) as { value: ICustomer['address'] }
    ).value;
    const additionalFields = executeFunctions.getNodeParameter('additionalFields', i) as {
      description?: string;
      externalId?: string;
      taxId?: string;
    };

    if (!contact?.email) {
      throw new Error('Contact email is required');
    }

    if (!address?.address1 || !address?.city || !address?.postalCode || !address?.country) {
      throw new Error('Address fields (address1, city, postal code, country) are required');
    }

    const customer: ICustomer = {
      name,
      type,
      contact,
      address,
      ...additionalFields,
    };

    debugLog('CUSTOMER_VALIDATE', 'Create customer input validated', { customer });
    return customer;
  }

  /**
   * Validate update customer input
   */
  export function validateUpdate(
    executeFunctions: IExecuteFunctions,
    i: number,
  ): Partial<ICustomer> {
    debugLog('CUSTOMER_VALIDATE', 'Validating update customer input');

    const additionalFields = executeFunctions.getNodeParameter('additionalFields', i) as {
      description?: string;
      externalId?: string;
      taxId?: string;
      name?: string;
      type?: 'person' | 'company';
    };

    if (Object.keys(additionalFields).length === 0) {
      throw new Error('At least one field to update must be provided');
    }

    debugLog('CUSTOMER_VALIDATE', 'Update customer input validated', { additionalFields });
    return additionalFields;
  }

  /**
   * Validate get many customers filters
   */
  export function validateGetMany(
    executeFunctions: IExecuteFunctions,
    i: number,
  ): ICustomerFilters {
    debugLog('CUSTOMER_VALIDATE', 'Validating get many customers filters');

    const filters = executeFunctions.getNodeParameter('filters', i) as ICustomerFilters;
    const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;

    if (!returnAll) {
      const limit = executeFunctions.getNodeParameter('limit', i) as number;
      filters.limit = limit;
    }

    debugLog('CUSTOMER_VALIDATE', 'Get many customers filters validated', { filters });
    return filters;
  }
}
