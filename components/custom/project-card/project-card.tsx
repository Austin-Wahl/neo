import DeleteProjectDialog from "@/components/custom/delete-project-dialog/delete-project-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import useDeleteProject from "@/hooks/use-delete-project";
import { Project } from "@/prisma/generated/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Folder, MoreHorizontal, Settings, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

export default function ProjectCard({
  id,
  name,
  description,
  icon,
  updatedAt,
}: Project) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const updatedAtLocal = new Date(updatedAt).toDateString();
  const { mutateAsync, status } = useDeleteProject(id);

  async function handleDelete() {
    try {
      await mutateAsync();
      setDialogOpen(false);
    } catch (error) {
      console.log(error);
    }
  }

  // Force cleanup on unmount
  useEffect(() => {
    return () => {
      setDialogOpen(false);
    };
  }, []);

  return (
    <>
      <Card
        key={id}
        className={`group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-card/80 hover:shadow-lg w-full sm:max-w-[300px] sm:aspect-video ${
          status === "pending" ? "animate-pulse cursor-progress" : ""
        }`}
        style={{ pointerEvents: status === "pending" ? "none" : "auto" }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Avatar>
                  <AvatarFallback>
                    <Skeleton />
                  </AvatarFallback>
                  <AvatarImage src={icon} />
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {updatedAtLocal}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    style={{ pointerEvents: "auto" }} // Ensure this button always works
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      window.location.href = `/project/${id}`;
                    }}
                  >
                    <Folder />
                    Open Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      window.location.href = `/project/${id}/settings`;
                    }}
                  >
                    <Settings />
                    Open Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onSelect={() => {
                      setDialogOpen(true);
                    }}
                    disabled={status === "pending"}
                  >
                    {status === "pending" ? (
                      <PuffLoader size={16} color={"var(--destructive)"} />
                    ) : (
                      <Trash color="var(--destructive)" />
                    )}
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {description}
          </CardDescription>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>

      {dialogOpen && (
        <DeleteProjectDialog
          handleDelete={handleDelete}
          status={status}
          onOpenChange={setDialogOpen}
          open={dialogOpen}
        />
      )}
    </>
  );
}
