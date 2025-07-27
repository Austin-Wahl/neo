"use client";
import {
  AlertDialog,
  AlertDialogAction,
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
import { Project } from "@/prisma/generated/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Upload, UploadIcon, X } from "lucide-react";
import { useState } from "react";
import { PuffLoader } from "react-spinners";

const ChangeIconModal = ({ project }: { project: Project }) => {
  const [files, setFiles] = useState<Array<File>>([]);

  const onFileValidate = () => {
    return undefined;
  };

  const onFileReject = () => {};
  return (
    <AlertDialog>
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
              style={{ borderRadius: "8px !important" }}
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
            maxFiles={2}
            className="w-full"
            multiple={false}
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
                  <FileUploadItemMetadata />
                  <FileUploadItemDelete asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <X />
                    </Button>
                  </FileUploadItemDelete>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Change</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChangeIconModal;
