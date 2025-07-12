"use client";

import Menubar from "@/components/custom/neo-studio/navbar/menu-bar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useSqlEditor from "@/hooks/use-sql-editor";
import { Project } from "@/prisma/generated/prisma";
import { Plug, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Navbar = ({
  projects,
  connections,
  connectionId,
  id,
}: {
  projects: Array<Project>;
  connections: Array<DatabaseConnectionWithConnectionDetails>;
  connectionId?: string;
  id: string;
}) => {
  const { database, setDatabase } = useSqlEditor();
  const router = useRouter();

  const handleProjectChange = (projectId: string) => {
    router.push(`/studio/project/${projectId}/connection`);
  };

  const handleConnectionChange = (connectionId: string) => {
    router.push(`/studio/project/${id}/connection/${connectionId}`);
  };

  return (
    <div className="w-[calc(100%-32px)] p-4 flex items-center border rounded-lg mx-4 justify-between fixed top-4 bg-background z-[10]">
      <div className="flex h-[32px] items-center">
        <div className="select-none mr-3">
          <p>
            <span className="font-extrabold">NEO</span> |{" "}
            <span className="font-extralight">Studio</span>
          </p>
        </div>
        <div className="w-[2px] h-[32px] bg-border"></div>
        <Menubar
          connectionId={connectionId}
          connections={connections!}
          id={id}
          projects={projects!}
        />
      </div>
      {database && (
        <div className="rounded-lg border flex items-center text-xs justify-between gap-4 overflow-hidden">
          <div className="p-2 flex items-center gap-2">
            <Plug size={12} />
            <p>{database}</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  setDatabase("");
                  toast("No Database is selected.");
                }}
                className="!bg-background hover:bg-accent rounded-none border-l-[1px] border-border cursor-pointer hover:text-primary text-muted-foreground"
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unselect Database</TooltipContent>
          </Tooltip>
        </div>
      )}
      <div className="flex items-center gap-4">
        <Select defaultValue={id} onValueChange={handleProjectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((project) => (
              <SelectItem value={project.id} key={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          defaultValue={connectionId}
          onValueChange={handleConnectionChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue
              placeholder={
                connections.length > 0 ? "Connection" : "No Connections"
              }
            />
          </SelectTrigger>
          {connections.length > 0 && (
            <SelectContent>
              {connections.map((connection) => (
                <SelectItem value={connection.id} key={connection.id}>
                  {connection.name}
                </SelectItem>
              ))}
            </SelectContent>
          )}
        </Select>
      </div>
    </div>
  );
};

export default Navbar;
