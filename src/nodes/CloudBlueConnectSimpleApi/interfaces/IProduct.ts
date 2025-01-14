import type { IDataObject } from 'n8n-workflow';

interface IProductPrice {
  currency: string;
  amount: string;
  type?: 'recurring' | 'setup' | 'overuse';
  model?: 'FLAT' | 'TIERED' | 'VOLUME_SUBSCRIPTION' | 'VOLUME_ORDER' | 'VOLUME_RESOURCE_AGGREGATED';
  lowerLimit?: number;
}

interface IPeriod {
  type: 'day' | 'month' | 'year' | 'statement_day' | 'unknown';
  duration: number;
}

interface IDependsOnItem {
  mpn: string;
  id: string;
}

interface ICoterming {
  required: 'MANDATORY' | 'ALLOWED' | 'RESTRICTED';
  type: 'SUBSCRIPTION' | 'END_OF_MONTH';
}

export interface IProduct extends IDataObject {
  mpn: string;
  vendor: string;
  id: string;
  serviceName: string;
  name: string;
  minimumQuantity: string;
  maximumQuantity: string;
  prices: IProductPrice[];
  costs: IProductPrice[];
  billingPeriod: IPeriod;
  subscriptionPeriod: IPeriod;
  billingModel:
    | 'chargeBeforeBillingPeriod'
    | 'chargeAfterBillingPeriod'
    | 'chargeBeforeSubscriptionPeriod'
    | 'chargeExternalRating'
    | 'unknown';
  dependsOn: IDependsOnItem[];
  coterming: ICoterming;
}
