import { APIResponse } from "@/app/(neo)/types/types";
import { Project } from "@/prisma/generated/prisma";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useDeleteProject = (projectId: string) => {
  const queryClient = useQueryClient();

  const mutate = useMutation<APIResponse<boolean>, Error>({
    mutationFn: async () => {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "DELETE",
      });

      const body: APIResponse<boolean> = await response.json();
      if (!response.ok) throw body;

      return body;
    },
    mutationKey: ["projects"],
    onSuccess: () => {
      toast("Project Deleted", {
        description: "Your project has been deleted!",
        dismissible: true,
      });

      removeProjectFromQueryClient();
    },
    onError: (e) => {
      toast("Project Not deleted", {
        description: e instanceof Error ? e.message : "There was an issue.",
        dismissible: true,
      });
    },
  });

  function removeProjectFromQueryClient() {
    queryClient.setQueryData(
      ["projects"],
      (oldData: {
        pageParams: Array<number>;
        pages: Array<APIResponse<Project[]>>;
      }) => {
        if (!oldData) return oldData;

        const filtered = oldData.pages.map((page) => {
          const newData = page.items?.filter((project) => {
            if (project.id !== projectId) return project;
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

export default useDeleteProject;
