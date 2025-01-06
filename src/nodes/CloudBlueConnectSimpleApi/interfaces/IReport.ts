export interface IReport {
    id: string;
    name: string;
    description?: string;
    status: 'pending' | 'processing' | 'ready' | 'failed';
    created: string;
    updated: string;
    period?: {
        from: string;
        to: string;
    };
    type: string;
    url?: string;
}

export interface IReportListResponse {
    reports: IReport[];
    total: number;
} 