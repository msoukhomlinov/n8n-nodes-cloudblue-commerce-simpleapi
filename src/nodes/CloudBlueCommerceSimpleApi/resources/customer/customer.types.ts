/**
 * @file Customer Type Definitions
 * @description Type definitions for the Customer resource.
 *
 * Defines:
 * - Core customer interfaces (base, contact, address)
 * - Request/Response types for API interactions
 * - Update interfaces for modification operations
 * - Filter types for list operations
 *
 * @module CloudBlueCommerceSimpleApi/resources/customer/types
 */

import type { IDataObject } from 'n8n-workflow';

export interface ICustomerContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ICustomerAddress {
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface ICustomer extends IDataObject {
  id?: string;
  externalId?: string;
  name: string;
  type?: 'person' | 'company';
  description?: string;
  contact: ICustomerContact;
  address: ICustomerAddress;
  taxId?: string;
}

export interface ICustomerUpdate extends IDataObject {
  externalId?: string;
  name?: string;
  type?: 'person' | 'company';
  description?: string;
  contact?: Partial<ICustomerContact>;
  address?: Partial<ICustomerAddress>;
  taxId?: string;
}

export interface ICustomerFilters extends IDataObject {
  name?: string;
  email?: string;
  externalId?: string;
  resellerId?: string;
}

export interface ICustomerListResponse {
  data: ICustomer[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
