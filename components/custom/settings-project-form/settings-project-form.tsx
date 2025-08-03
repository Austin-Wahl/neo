"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useUpdateProject from "@/hooks/use-update-project";
import { Project } from "@/prisma/generated/prisma";
import { updateProjectSchema } from "@/validation-schemas/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PuffLoader } from "react-spinners";
import { z } from "zod";

const ProjectSettingsForm = ({ project }: { project: Project }) => {
  const router = useRouter();
  const { mutateAsync, status } = useUpdateProject({ projectId: project.id });
  const form = useForm<z.infer<typeof updateProjectSchema>>({
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
    },
    resolver: zodResolver(updateProjectSchema),
  });

  // Function handles the update request
  async function handleUpdate(data: z.infer<typeof updateProjectSchema>) {
    try {
      await mutateAsync(data);
      router.refresh();
      form.reset(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleUpdate)}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Project Name" {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Super epic and cool project..."
                      className="max-h-[200px] "
                      {...field}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {form.formState.isDirty && (
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => form.reset()}
                disabled={status === "pending"}
              >
                Reset
              </Button>
              <Button type="submit" disabled={status === "pending"}>
                {status === "pending" && <PuffLoader size={16} />}
                Save
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default ProjectSettingsForm;
