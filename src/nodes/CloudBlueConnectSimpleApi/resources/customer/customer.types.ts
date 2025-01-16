/**
 * @file Customer Resource Types
 * @description Type definitions for the customer resource operations
 * Implements:
 * - Base customer interface
 * - Customer response interfaces
 * - Customer update interface
 * - Customer filter types
 *
 * @module CloudBlueConnectSimpleApi/resources/customer
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

export interface ICustomerUpdate {
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
  items: ICustomer[];
  offset: number;
  limit: number;
  total: number;
}
