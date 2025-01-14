import type { IDataObject } from 'n8n-workflow';

interface IOwner {
  readonly id: string;
  name: string;
}

interface IContactInfo {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface IMarketplace extends IDataObject {
  readonly id: string;
  name: string;
  description?: string;
  icon?: string;
  owner: IOwner;
  currency: string;
  active: boolean;
  code?: string;
  status?: 'pending' | 'active' | 'creditHold' | 'adminHold' | 'cancelled' | 'error';
  type?: string;
  externalId?: string;
  attributes?: Record<string, string>;
  contactInfo?: IContactInfo;
}
