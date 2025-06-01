import { typeToFlattenedError } from "zod";

export type APIResponse<T = unknown> = {
  message: string;
  data?: T;
  items?: T;
  error?: string;
  pagination: Pagination;
  zodValidationDetails?: typeToFlattenedError<T>;
};

export interface Pagination {
  currentPage: number;
  hasNextPage: boolean;
  metadata: {
    skippedRecords: number;
    limit: number;
    totalRecords: number;
  };
}
