"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import useCreateProject, {
  CreateProjectFormValues,
} from "@/hooks/use-create-project";
import { useIsMobile } from "@/hooks/use-mobile";
import { createProjectSchema } from "@/validation-schemas/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, PlusCircle } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";

interface CreateProjectFormProps {
  handleSubmit: SubmitHandler<CreateProjectFormValues>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<CreateProjectFormValues>;
  trigger?: ReactNode;
  asChild?: boolean;
}

const CreateProjectCard = ({
  trigger,
  asChild,
}: {
  trigger?: ReactNode;
  asChild?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { mutateAsync } = useCreateProject();

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      description: "",
      name: "New Project",
    },
  });

  async function handleSubmit(data: CreateProjectFormValues) {
    try {
      await mutateAsync(data);

      form.reset();
      setOpen(false);
    } catch (error) {
      console.log(error);
      toast("Project Not Created", {
        description: "There was an issue creating your project.",
      });
    }
  }

  if (!isMobile) {
    return (
      <DesktopForm
        form={form}
        handleSubmit={handleSubmit}
        open={open}
        setOpen={setOpen}
        trigger={trigger}
        asChild={asChild}
      />
    );
  }

  return (
    <MobileForm
      form={form}
      handleSubmit={handleSubmit}
      open={open}
      setOpen={setOpen}
      trigger={trigger}
      asChild={asChild}
    />
  );
};

const CreateProjectCardTrigger = () => {
  return (
    <div className="w-[calc(100vw-32px)] sm:w-[300px] flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-secondary/30 transition-all border-border border-[1px] rounded-lg bg-secondary/40 aspect-video">
      <Plus className="center text-muted-foreground" />
      <p className="center text-muted-foreground">Create Project</p>
    </div>
  );
};

const DesktopForm = ({
  form,
  open,
  setOpen,
  handleSubmit,
  trigger,
  asChild,
}: CreateProjectFormProps) => {
  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild={asChild}>
          {trigger ? trigger : <CreateProjectCardTrigger />}
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Create a Project</DialogTitle>
              <DialogDescription>
                Projects help organize Database connections.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Project Name"
                        {...field}
                        autoFocus={false}
                      />
                    </FormControl>
                    <FormDescription>
                      Name your project. You can change this later.
                    </FormDescription>
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
                        placeholder="Project Description"
                        {...field}
                        autoFocus={false}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      Name your project. You can change this later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting ? (
                  <PuffLoader size={20} />
                ) : (
                  <PlusCircle />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
};

const MobileForm = ({
  form,
  open,
  setOpen,
  handleSubmit,
  trigger,
  asChild,
}: CreateProjectFormProps) => {
  return (
    <Form {...form}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild={asChild}>
          {trigger ? trigger : <CreateProjectCardTrigger />}
        </DrawerTrigger>
        <DrawerContent>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DrawerHeader>
              <DrawerTitle>Create a Project</DrawerTitle>
              <DrawerDescription>
                Projects help organize Database connections.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Project Name"
                        {...field}
                        autoFocus={false}
                      />
                    </FormControl>
                    <FormDescription>
                      Name your project. You can change this later.
                    </FormDescription>
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
                        placeholder="Project Description"
                        {...field}
                        autoFocus={false}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      Name your project. You can change this later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting ? (
                  <PuffLoader size={20} />
                ) : (
                  <PlusCircle />
                )}
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                type="button"
              >
                Cancel
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </Form>
  );
};

export default CreateProjectCard;
