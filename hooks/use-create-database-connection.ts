import { APIResponse } from "@/app/types/types";
import { Connection } from "@/prisma/generated/prisma";
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
    APIResponse<Connection>,
    Error,
    CreateDatabaseConnectionFormProps
  >({
    mutationFn: async (data) => {
      const response = await fetch(`/api/project/${projectId}/connection`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      const body: APIResponse<Connection> = await response.json();
      if (!response.ok) throw body;

      return body;
    },
    mutationKey: ["project", projectId, "connections"],
    onSuccess: ({ data }) => {
      toast("Project Created", {
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

  function addNewConnectionToQueryClient(newProject: Connection) {
    queryClient.setQueryData(
      ["project", projectId, "connections"],
      (oldData: {
        pageParams: Array<number>;
        pages: Array<APIResponse<Connection[]>>;
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
