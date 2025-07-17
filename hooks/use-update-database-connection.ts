import { APIResponse } from "@/app/(neo)/types/types";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import { createDatabaseConnectionSchema } from "@/validation-schemas/connection";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const schema = createDatabaseConnectionSchema.partial();
export type UpdateDatabaseConnectionFormProps = z.infer<typeof schema>;
type Connection = DatabaseConnectionWithConnectionDetails;
type InfiniteData = {
  pages: Array<{ items?: Connection[] }>;
  pageParams: Array<unknown>;
};
type TraditionalData = { items?: Connection[] };

const useUpdateDatabaseConnection = ({
  projectId,
  connectionId,
}: {
  projectId: string;
  connectionId: string;
}) => {
  const queryClient = useQueryClient();

  const mutate = useMutation<
    APIResponse<DatabaseConnectionWithConnectionDetails>,
    Error,
    UpdateDatabaseConnectionFormProps
  >({
    mutationFn: async (data) => {
      const response = await fetch(`/api/connection/${connectionId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      const body: APIResponse<DatabaseConnectionWithConnectionDetails> =
        await response.json();
      if (!response.ok) throw body;

      return body;
    },
    mutationKey: ["project", "connections", projectId],
    onSuccess: (newData) => {
      toast("Connection Updated", {
        description: "Your connection has been updated!",
        dismissible: true,
      });

      updateConnectionQueryCache(newData);
    },
    onError: (e) => {
      toast("Update Failed", {
        description: e instanceof Error ? e.message : "There was an issue.",
        dismissible: true,
      });
    },
  });

  // This function updates instances of the respective caches. Its either infinate data or not.
  function updateConnectionQueryCache(
    newDataConnection: APIResponse<Connection>
  ) {
    const projectId = newDataConnection.data?.projectId;
    // Get all the cached queries for a projects connections
    const queries = queryClient.getQueriesData({
      predicate: (query) =>
        query.queryKey[0] === "project" &&
        query.queryKey[1] === "connections" &&
        query.queryKey[2] === projectId,
    });

    // Loop through each matching query and update its data
    queries.forEach(([queryKey, data]) => {
      if (!data) return; // Skip if no data

      let updatedData: typeof data;

      // Detect and handle infinite query
      if (
        "pages" in (data as InfiniteData) &&
        Array.isArray((data as InfiniteData).pages)
      ) {
        // Infinite: Map over each page and update items
        const updatedPages = (data as InfiniteData).pages.map((page) => {
          if (!page.items) return page;
          const updatedItems = page.items.map((connection) =>
            connection.id === newDataConnection.data?.id
              ? newDataConnection.data
              : connection
          );
          return { ...page, items: updatedItems };
        });
        updatedData = { ...data, pages: updatedPages } as InfiniteData;
      }
      // Detect and handle traditional paginated query
      else if (
        "items" in (data as TraditionalData) &&
        Array.isArray((data as TraditionalData).items)
      ) {
        const updatedItems = (data as TraditionalData).items?.map(
          (connection) =>
            connection.id === newDataConnection.data?.id
              ? newDataConnection.data
              : connection
        );
        updatedData = { ...data, items: updatedItems } as TraditionalData;
      } else if (Array.isArray(data)) {
        updatedData = data.map((connection) =>
          connection.id === newDataConnection.data?.id
            ? newDataConnection.data
            : connection
        );
      }
      // Skip if data shape doesn't match (add more conditions if needed)
      else {
        console.warn(`Skipping unsupported data shape for key: ${queryKey}`);
        return;
      }

      queryClient.setQueryData(queryKey, updatedData);
    });
  }

  return mutate;
};

export default useUpdateDatabaseConnection;
