"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

const CreateProjectCard = () => {
  const form = useForm({
    // resolver: zodResolver(),
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <CreateProjectCardTrigger />
      </DialogTrigger>
      <Form>
        <form>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Project</DialogTitle>
              <DialogDescription>
                Projects help organize Database connections.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
};

const CreateProjectCardTrigger = () => {
  return (
    <div className="w-screen sm:w-[300px] flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-secondary/30 transition-all border-border border-[1px] rounded-lg bg-secondary/40 aspect-video">
      <Plus className="center text-muted-foreground" />
      <p className="center text-muted-foreground">Create Project</p>
    </div>
  );
};

export default CreateProjectCard;
