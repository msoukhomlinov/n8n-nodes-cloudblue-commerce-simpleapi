/**
 * @file Customer Resource Validator
 * @description Handles validation for customer resource operations in the CloudBlue Commerce API.
 *
 * Implements validation for:
 * - Get operation parameters
 * - Create operation data validation
 * - Update operation data validation
 * - Get many operation filters
 * - Email format validation
 *
 * Features:
 * - Singleton pattern for consistent validation rules
 * - Comprehensive input validation
 * - Type checking and data structure validation
 * - Required field validation
 * - Format validation for specific fields (email)
 *
 * @module CloudBlueCommerceSimpleApi/resources/customer
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import type { IDataObject } from 'n8n-workflow';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { debugLog } from '../../utils/debug';
import type {
  ICustomerFilters,
  ICustomer,
  ICustomerUpdate,
  ICustomerContact,
  ICustomerAddress,
} from './customer.types';
import { PAGINATION } from '../../utils/constants';

export class CustomerValidator {
  private static instance: CustomerValidator;
  private readonly apiService: CloudBlueApiService;

  private constructor(apiService: CloudBlueApiService) {
    this.apiService = apiService;
  }

  public static getInstance(apiService: CloudBlueApiService): CustomerValidator {
    if (!CustomerValidator.instance) {
      CustomerValidator.instance = new CustomerValidator(apiService);
    }
    return CustomerValidator.instance;
  }

  /**
   * Validate get operation parameters
   */
  public validateGetOperation(executeFunctions: IExecuteFunctions, i: number): string {
    debugLog('RESOURCE_EXEC', 'Validating get customer input');

    const id = executeFunctions.getNodeParameter('id', i) as string;
    if (!id) {
      throw new Error('Customer ID is required');
    }

    debugLog('RESOURCE_EXEC', 'Get customer input validated', { id });
    return id;
  }

  /**
   * Validate create customer input
   */
  public validateCreateOperation(executeFunctions: IExecuteFunctions, i: number): ICustomer {
    debugLog('RESOURCE_EXEC', 'Validating create customer input');

    const name = executeFunctions.getNodeParameter('name', i) as string;
    if (!name) {
      throw new Error('Customer name is required');
    }

    const contact = executeFunctions.getNodeParameter('contact', i) as ICustomerContact;
    const address = executeFunctions.getNodeParameter('address', i) as ICustomerAddress;
    const additionalFields = executeFunctions.getNodeParameter('additionalFields', i) as Partial<
      Omit<ICustomer, 'name' | 'contact' | 'address'>
    >;

    // Validate email format
    if (!contact?.email) {
      throw new Error('Contact email is required');
    }
    if (!this.isValidEmail(contact.email)) {
      throw new Error('Invalid email format');
    }

    // Validate required address fields
    if (!address?.address1 || !address?.city || !address?.postalCode || !address?.country) {
      throw new Error('Address fields (address1, city, postal code, country) are required');
    }

    const customer: ICustomer = {
      name,
      contact,
      address,
      ...additionalFields,
    };

    debugLog('RESOURCE_EXEC', 'Create customer input validated', { customer });
    return customer;
  }

  /**
   * Validate update customer input
   */
  public validateUpdateOperation(executeFunctions: IExecuteFunctions, i: number): ICustomerUpdate {
    debugLog('RESOURCE_EXEC', 'Validating update customer input');

    const id = this.validateGetOperation(executeFunctions, i);
    const additionalFields = executeFunctions.getNodeParameter(
      'additionalFields',
      i,
    ) as ICustomerUpdate;

    if (Object.keys(additionalFields).length === 0) {
      throw new Error('At least one field to update must be provided');
    }

    // Validate email format if provided in contact update
    if (additionalFields.contact?.email && !this.isValidEmail(additionalFields.contact.email)) {
      throw new Error('Invalid email format in contact update');
    }

    debugLog('RESOURCE_EXEC', 'Update customer input validated', { id, additionalFields });
    return additionalFields;
  }

  /**
   * Validate get many customers filters
   */
  public validateGetManyOperation(
    executeFunctions: IExecuteFunctions,
    i: number,
  ): ICustomerFilters {
    debugLog('RESOURCE_EXEC', 'Validating get many customers filters');

    const filters = executeFunctions.getNodeParameter('filters', i, {}) as ICustomerFilters;

    // Validate filter values
    if (filters.email && !this.isValidEmail(filters.email)) {
      throw new Error('Invalid email format in filter');
    }

    // Handle pagination parameters
    const returnAll = executeFunctions.getNodeParameter('returnAll', i, false) as boolean;
    filters.limit = returnAll
      ? PAGINATION.MAX_LIMIT
      : (executeFunctions.getNodeParameter('limit', i) as number);
    if (!returnAll) {
      if (filters.limit <= 0) {
        throw new Error('Limit must be greater than 0');
      }
      filters.offset = executeFunctions.getNodeParameter('offset', i, 0) as number;
    }

    debugLog('RESOURCE_EXEC', 'Get many customers filters validated', { filters });
    return filters;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
