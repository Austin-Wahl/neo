import { APIResponse } from "@/app/(neo)/types/types";
import { Project } from "@/prisma/generated/prisma";
import { updateProjectSchema } from "@/validation-schemas/project";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const schema = updateProjectSchema.partial();
export type UpdateProjectFormProps = z.infer<typeof schema>;
type InfiniteData = {
  pages: Array<{ items?: Project[] }>;
  pageParams: Array<unknown>;
};
type TraditionalData = { items?: Project[] };

const useUpdateProject = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient();

  const mutate = useMutation<
    APIResponse<Project>,
    Error,
    UpdateProjectFormProps
  >({
    mutationFn: async (data) => {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      const body: APIResponse<Project> = await response.json();
      if (!response.ok) throw body;

      return body;
    },
    mutationKey: ["projects"],
    onSuccess: (newData) => {
      toast("Project Updated", {
        description: "Your project has been updated!",
        dismissible: true,
      });

      updateProjectQueryCache(newData);
    },
    onError: (e) => {
      toast("Update Failed", {
        description: e instanceof Error ? e.message : "There was an issue.",
        dismissible: true,
      });
    },
  });

  // This function updates instances of the respective caches. Its either infinate data or not.
  function updateProjectQueryCache(updatedProject: APIResponse<Project>) {
    // Get all the cached queries for a projects connections
    const queries = queryClient.getQueriesData({
      predicate: (query) => query.queryKey[0] === "projects",
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
          const updatedItems = page.items.map((project) =>
            project.id === updatedProject.data?.id
              ? updatedProject.data
              : project
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
        const updatedItems = (data as TraditionalData).items?.map((project) =>
          project.id === updatedProject.data?.id ? updatedProject.data : project
        );
        updatedData = { ...data, items: updatedItems } as TraditionalData;
      } else if (Array.isArray(data)) {
        updatedData = data.map((project) =>
          project.id === updatedProject.data?.id ? updatedProject.data : project
        );
      }
      // Skip if data shape doesn't match
      else {
        console.warn(`Skipping unsupported data shape for key: ${queryKey}`);
        return;
      }

      queryClient.setQueryData(queryKey, updatedData);
    });
  }

  return mutate;
};

export default useUpdateProject;
