import { Pagination } from "@/app/types/types";

function calculatePagination({
  offset,
  limit,
  totalRecords,
}: {
  offset?: number;
  limit?: number;
  totalRecords: number;
}): Pagination {
  const currentPage = Math.floor(offset ?? 0 / (limit ?? 20)) + 1;
  const totalPages = Math.floor((totalRecords as number) / (limit ?? 20)) + 1;
  const hasNextPage = currentPage < totalPages;

  return {
    currentPage,
    hasNextPage,
    metadata: {
      limit: limit ?? 20,
      skippedRecords: offset || 0,
      totalRecords: totalRecords || 0,
    },
  };
}

export default calculatePagination;
