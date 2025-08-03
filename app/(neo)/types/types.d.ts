import { NeoSqlError } from "@/services/types";
import { typeToFlattenedError } from "zod";
import { NeoQueryResponse } from "@/services/types";

export type APIResponse<T = unknown> = {
  message: string;
  data?: T;
  items?: T;
  error?: string | NeoSqlError;
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

export interface NeoQueryServerResponse {
  result: NeoQueryResponse;
  queryId: string;
}
