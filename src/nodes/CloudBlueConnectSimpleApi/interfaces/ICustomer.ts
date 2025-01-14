import type { IDataObject } from 'n8n-workflow';

interface IAddress {
  streetAddress: string;
  addressExtension?: string;
  postalCode: string;
  city: string;
  state?: string;
  countryCode: string;
}

interface IContactPerson {
  type: 'admin' | 'billing' | 'technical';
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  login?: string;
  password?: string;
}

export interface ICustomer extends IDataObject {
  readonly id: string;
  externalId?: string;
  name: string;
  description?: string;
  taxRegId?: string;
  readonly status: 'pending' | 'active' | 'creditHold' | 'adminHold' | 'cancelled' | 'error';
  address: IAddress;
  contactPersons: IContactPerson[];
  language: string;
  readonly resellerId?: string;
  attributes?: Record<string, string>;
  readonly creationDate?: string;
  readonly lastUpdateDate?: string;
}
