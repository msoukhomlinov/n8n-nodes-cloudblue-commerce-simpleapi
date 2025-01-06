export interface IResellerAddress {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
}

export interface IResellerContact {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
}

export interface IReseller {
    id: string;
    name: string;
    tax_id?: string;
    status: 'active' | 'inactive';
    external_id?: string;
    address: IResellerAddress;
    contact: IResellerContact;
    created: string;
    updated: string;
}

export interface IResellerListResponse {
    resellers: IReseller[];
    total: number;
} 