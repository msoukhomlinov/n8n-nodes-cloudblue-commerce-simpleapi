import type { JsonObject } from 'n8n-workflow';

export interface IErrorDetails {
    message: string;
    description: string;
    httpCode: string;
    correlationId?: string;
}

export function mapError(error: JsonObject): IErrorDetails {
    const response = error.response as JsonObject;
    if (!response) {
        return {
            message: 'Unknown error occurred',
            description: error.message?.toString() || '',
            httpCode: '500',
        };
    }

    const statusCode = Number.parseInt(response.status?.toString() || '500', 10);
    const correlationId = response.correlationId?.toString();

    return {
        message: response.message?.toString() || 'Unknown error occurred',
        description: response.details?.toString() || '',
        httpCode: statusCode.toString(),
        correlationId,
    };
} 