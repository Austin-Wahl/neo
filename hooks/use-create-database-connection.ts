import { APIResponse } from "@/app/(neo)/types/types";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import { createProjectSchema } from "@/validation-schemas/project";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

export type CreateDatabaseConnectionFormProps = z.infer<
  typeof createProjectSchema
>;

const useCreateDatabaseConnection = (projectId: string) => {
  const queryClient = useQueryClient();

  const mutate = useMutation<
    APIResponse<DatabaseConnectionWithConnectionDetails>,
    Error,
    CreateDatabaseConnectionFormProps
  >({
    mutationFn: async (data) => {
      const response = await fetch(`/api/project/${projectId}/connection`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      const body: APIResponse<DatabaseConnectionWithConnectionDetails> =
        await response.json();
      if (!response.ok) throw body;

      return body;
    },
    mutationKey: ["project", "connections", projectId],
    onSuccess: ({ data }) => {
      toast("Connection Created", {
        description:
          "Your connection has been created! If you don't see it, refresh.",
        dismissible: true,
      });

      addNewConnectionToQueryClient(data!);
    },
    onError: () => {
      toast("Connection Not Created", {
        description: "There was an issue creating the connection..",
        dismissible: true,
      });
    },
  });

  function addNewConnectionToQueryClient(
    newProject: DatabaseConnectionWithConnectionDetails
  ) {
    queryClient.setQueryData(
      ["project", "connections", projectId],
      (oldData: {
        pageParams: Array<number>;
        pages: Array<APIResponse<DatabaseConnectionWithConnectionDetails[]>>;
      }) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              items: [newProject, ...(oldData.pages[0].items ?? [])],
            },
            ...oldData.pages.slice(1),
          ],
        };
      }
    );
  }

  return mutate;
};

export default useCreateDatabaseConnection;
