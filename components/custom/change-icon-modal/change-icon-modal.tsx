"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import useUpdateProjectIcon from "@/hooks/use-update-project-icon";
import { Project } from "@/prisma/generated/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Upload, UploadIcon, X } from "lucide-react";
import { useCallback, useState } from "react";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";

const ChangeIconModal = ({ project }: { project: Project }) => {
  const [files, setFiles] = useState<Array<File>>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const { mutateAsync, status } = useUpdateProjectIcon({
    projectId: project.id,
  });
  const UploadImage = async () => {
    try {
      await mutateAsync(files[0]);
      setOpen(false);
      setFiles([]);
      setError("");
    } catch (error) {
      console.log(error);
    }
  };

  const onFileValidate = useCallback(
    (file: File): string | null | undefined => {
      // Perform very basic validation. Actual validation is performed server side
      setError("");
      const allowedMimeTypes: Array<string> = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (file.size > 4 * 1024 * 1024) {
        return "Files must be 4MB or less!";
      }

      if (!allowedMimeTypes.includes(file.type)) {
        return "Image format not supported!";
      }
    },
    [files]
  );

  const onFileReject = (file: File, error: string): void | undefined => {
    setError(error);
    toast(error, { dismissible: true });
  };
  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setFiles([]);
          setError("");
        }
      }}
    >
      <AlertDialogTrigger>
        <div className="relative group w-[60px] h-[60px] overflow-hidden rounded-lg transition-all duration-100">
          <div className="absolute top-0 left-0 w-full h-full group group-hover:opacity-100 z-[10] flex items-center justify-center bg-[rgba(0,0,0,.5)] opacity-0">
            <UploadIcon size={16} />
          </div>
          <Avatar className="w-[60px] h-[60px] flex !rounded-lg !overflow-hidden absolute top-0 left-0">
            <AvatarFallback className="rounded-none">
              <PuffLoader size={16} color="var(--foreground)" />
            </AvatarFallback>
            <AvatarImage
              src={project.icon}
              className="w-full h-full object-cover"
              style={{ borderRadius: "8px" }}
            />
          </Avatar>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Icon</AlertDialogTitle>
          <AlertDialogDescription>
            Change your Project&apos;s icon.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <FileUpload
            value={files}
            onValueChange={setFiles}
            onFileValidate={onFileValidate}
            onFileReject={onFileReject}
            accept="image/*"
            maxFiles={1}
            className="w-full"
            multiple={false}
            onProgress={(event) => console.log(event.target)}
          >
            <FileUploadDropzone>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">Drag & drop files here</p>
                <p className="text-muted-foreground text-xs">
                  Or click to browse
                </p>
              </div>
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 w-fit">
                  Browse files
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
              {files.map((file) => (
                <FileUploadItem key={file.name} value={file}>
                  <FileUploadItemPreview />
                  {/* {status === "pending" &&< FileUploadItemProgress />} */}
                  <FileUploadItemMetadata />
                  <FileUploadItemDelete asChild disabled={status === "pending"}>
                    <Button variant="ghost" size="icon" className="size-7">
                      <X />
                    </Button>
                  </FileUploadItemDelete>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>
          <p className="text-destructive ml-auto mr-auto text-center italic mt-2 text-sm">
            {error}
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={status === "pending"}>
            Cancel
          </AlertDialogCancel>
          <Button
            disabled={files.length < 1 || status === "pending"}
            onClick={UploadImage}
          >
            {status === "pending" && <PuffLoader size={16} />}
            Change
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChangeIconModal;
