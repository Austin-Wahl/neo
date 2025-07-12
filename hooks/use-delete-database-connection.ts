import { APIResponse } from "@/app/(neo)/types/types";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type DeleteDatabaseConnectionFormProps = { connectionId: string };

const useDeleteDatabaseConnection = (projectId: string) => {
  const queryClient = useQueryClient();

  const mutate = useMutation<
    APIResponse<boolean>,
    Error,
    DeleteDatabaseConnectionFormProps
  >({
    mutationFn: async (data) => {
      const response = await fetch(`/api/connection/${data.connectionId}`, {
        method: "DELETE",
      });

      const body: APIResponse<boolean> = await response.json();
      if (!response.ok) throw body;

      return body;
    },
    mutationKey: ["project", "connections", projectId],
    onSuccess: ({}, vars) => {
      toast("Connection Deleted", {
        description: "Your connection has been deleted!",
        dismissible: true,
      });

      removeConnectionFromQueryClient(vars.connectionId);
    },
    onError: (e) => {
      toast("Connection Not Created", {
        description: e instanceof Error ? e.message : "There was an issue.",
        dismissible: true,
      });
    },
  });

  function removeConnectionFromQueryClient(connectionId: string) {
    queryClient.setQueryData(
      ["project", "connections", projectId],
      (oldData: {
        pageParams: Array<number>;
        pages: Array<APIResponse<DatabaseConnectionWithConnectionDetails[]>>;
      }) => {
        if (!oldData) return oldData;

        const filtered = oldData.pages.map((page) => {
          const newData = page.items?.filter((connection) => {
            if (connection.id !== connectionId) return connection;
          });
          return { ...page, items: newData };
        });

        return {
          ...oldData,
          pages: filtered,
        };
      }
    );
  }

  return mutate;
};

export default useDeleteDatabaseConnection;
