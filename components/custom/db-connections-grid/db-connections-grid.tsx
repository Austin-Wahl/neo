"use client";
import { APIResponse } from "@/app/(neo)/types/types";
import DBConnection from "@/components/custom/db-connection/db-connection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import calculatePagination from "@/utils/calculate-pagination";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { PulseLoader } from "react-spinners";

const DBConnectionsGrid = ({
  connections,
  projectId,
  totalRecords,
}: {
  connections: Array<DatabaseConnectionWithConnectionDetails>;
  totalRecords: number;
  projectId: string;
}) => {
  const queryLimit = 20;
  const { ref, inView } = useInView();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, error } =
    useInfiniteQuery<
      APIResponse<Array<DatabaseConnectionWithConnectionDetails>>
    >({
      queryKey: ["project", "connections", projectId],
      initialData: {
        pageParams: [0],
        pages: [
          {
            message: "Data retrieved",
            items: connections,
            pagination: calculatePagination({
              totalRecords: totalRecords,
              limit: queryLimit,
              offset: 0,
            }),
          },
        ],
      },
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => {
        return lastPage.pagination.hasNextPage
          ? lastPage.pagination.metadata.skippedRecords + queryLimit
          : undefined;
      },
      initialPageParam: queryLimit,
      queryFn: ({ pageParam }) => fetchProjectConnections(pageParam as number),
    });

  useEffect(() => {
    if (inView && hasNextPage && !error) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, error]);

  async function fetchProjectConnections(
    offset: number
  ): Promise<APIResponse<Array<DatabaseConnectionWithConnectionDetails>>> {
    const response = await fetch(
      `/api/project/${projectId}/connections?offset=${offset}`
    );

    const body: APIResponse<Array<DatabaseConnectionWithConnectionDetails>> =
      await response.json();

    if (!response.ok) {
      throw new Error(body.message || "Failed to fetch connections");
    }

    return body;
  }

  return (
    <div className="flex flex-col gap-2">
      {data?.pages.map((page) => {
        return page.items!.map((connection) => {
          return <DBConnection key={connection.id} connection={connection} />;
        });
      })}
      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Failed to load additional connections!</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : error}
          </AlertDescription>
        </Alert>
      )}
      <div ref={ref}>
        {isFetchingNextPage && (
          <PulseLoader color="var(--foreground)" size={12} />
        )}
      </div>
    </div>
  );
};

export default DBConnectionsGrid;
