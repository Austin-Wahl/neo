"use client";
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
import { Project } from "@/prisma/generated/prisma";
import { updateProjectSchema } from "@/validation-schemas/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ProjectSettingsForm = ({ project }: { project: Project }) => {
  const form = useForm<z.infer<typeof updateProjectSchema>>({
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
    },
    resolver: zodResolver(updateProjectSchema),
  });

  // Function handles the update request
  async function handleUpdate() {
    try {
    } catch (error) {
      console.log(error);
    }
  }

  // Project name
  // Description
  // Icon
  // Users TODO: Implement Project sharing

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={handleUpdate} className="flex flex-col gap-2">
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
        </form>
      </Form>
    </div>
  );
};

export default ProjectSettingsForm;
