export interface IApiResponse<T> {
    success: boolean;
    data: T;
    correlationId?: string;
} 