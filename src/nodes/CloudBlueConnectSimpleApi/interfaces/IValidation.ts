export interface IValidationParameter {
    id: string;
    name: string;
    type: string;
    value: string;
    title?: string;
    description?: string;
    required: boolean;
    constraints?: {
        hidden?: boolean;
        readonly?: boolean;
        choices?: string[];
        minLength?: number;
        maxLength?: number;
        minValue?: number;
        maxValue?: number;
        pattern?: string;
    };
}

export interface IValidationRequest {
    parameters: IValidationParameter[];
}

export interface IValidationResponse {
    valid: boolean;
    errors?: {
        parameter: string;
        message: string;
    }[];
} 