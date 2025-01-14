export interface IPagination {
  offset: number;
  limit: number;
  total: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPagination;
}
