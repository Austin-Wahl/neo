"use client";

import DeleteProjectDialog from "@/components/custom/delete-project-dialog/delete-project-dialog";
import { Button } from "@/components/ui/button";
import useDeleteProject from "@/hooks/use-delete-project";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PuffLoader } from "react-spinners";

const DeleteProjectSettingsCard = ({ projectId }: { projectId: string }) => {
  const { mutateAsync, status } = useDeleteProject(projectId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    try {
      await mutateAsync();
      setDialogOpen(false);
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      <div className="flex flex-col gap-4">
        <p className="text-destructive text-2xl">Danger Zone</p>
        <div className="rounded-lg border bg-card p-4 flex flex-col gap-2 sm:justify-between sm:flex-row sm:items-center">
          <div>
            <p>Delete Project</p>
            <p className="text-sm text-muted-foreground">
              Deleting your Project will remove all Connections and Project
              data.
            </p>
          </div>
          <div>
            <Button
              variant="destructive"
              onClick={() => setDialogOpen(true)}
              disabled={status === "pending"}
            >
              {status === "pending" ? (
                <PuffLoader size={16} color={"var(--destructive)"} />
              ) : (
                <Trash color="var(--destructive)" />
              )}
              Delete Project
            </Button>
          </div>
        </div>
      </div>

      <DeleteProjectDialog
        handleDelete={handleDelete}
        status={status}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      />
    </>
  );
};

export default DeleteProjectSettingsCard;
