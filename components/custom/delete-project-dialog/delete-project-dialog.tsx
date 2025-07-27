"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { PuffLoader } from "react-spinners";

const DeleteProjectDialog = ({
  handleDelete,
  status,
  onOpenChange,
  open,
}: {
  status: "error" | "idle" | "pending" | "success";
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  handleDelete: () => Promise<void>;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            project and all connections. This action <strong>DOES NOT</strong>{" "}
            delete your databases.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={status === "pending"}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={status === "pending"}
            variant="destructive"
          >
            {status === "pending" ? (
              <PuffLoader size={16} color={"var(--destructive)"} />
            ) : (
              <Trash color="var(--destructive)" />
            )}
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProjectDialog;
