export type APIResponse<T = unknown> = {
  message: string;
  data?: T;
  items?: Array<T>;
  error?: string;
  pagination: Pagination;
};

export interface Pagination {
  currentPage: number;
  hasNextPage: boolean;
  metadata: {
    skippedRecords: number;
    limit: number;
  };
}
