import { APIResponse } from "@/app/types/types";
import { Project } from "@/prisma/generated/prisma";
import { createProjectSchema } from "@/validation-schemas/project";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

const useCreateProject = () => {
  const queryClient = useQueryClient();

  const mutate = useMutation<
    APIResponse<Project>,
    Error,
    CreateProjectFormValues
  >({
    mutationFn: async (data) => {
      const response = await fetch("/api/project", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const body: APIResponse<Project> = await response.json();
      if (!response.ok) throw body;

      return body;
    },
    mutationKey: ["projects"],
    onSuccess: ({ data }) => {
      toast("Project Created", {
        description:
          "Your project has been created! If you don't see it, refresh.",
        dismissible: true,
      });

      addNewProjectToQueryClient(data!);
    },
    onError: () => {
      toast("Project Not Created", {
        description: "There was an issue creating your project.",
        dismissible: true,
      });
    },
  });

  function addNewProjectToQueryClient(newProject: Project) {
    queryClient.setQueryData(
      ["projects"],
      (oldData: {
        pageParams: Array<number>;
        pages: Array<APIResponse<Project[]>>;
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

export default useCreateProject;
