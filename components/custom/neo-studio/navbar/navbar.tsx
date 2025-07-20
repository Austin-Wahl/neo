"use client";

import { APIResponse } from "@/app/(neo)/types/types";
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
import calculatePagination from "@/utils/calculate-pagination";
import { useQuery } from "@tanstack/react-query";
import { Plug, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Navbar = ({
  projects,
  connections,
  connection,
  id,
}: {
  projects: Array<Project>;
  connections: Array<DatabaseConnectionWithConnectionDetails>;
  connection?: DatabaseConnectionWithConnectionDetails;
  id: string;
}) => {
  const connectionId: string | undefined = connection
    ? connection.id
    : undefined;
  const queryLimit = connections.length;
  const { database, setDatabase } = useSqlEditor();

  const router = useRouter();

  async function getConnections(): Promise<
    APIResponse<Array<DatabaseConnectionWithConnectionDetails>>
  > {
    try {
      const response = await fetch(`/api/project/${id}/connections`);

      const body: APIResponse<Array<DatabaseConnectionWithConnectionDetails>> =
        await response.json();
      if (!response.ok) throw body;

      return body;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  const { data: cachedConnections } = useQuery<
    APIResponse<Array<DatabaseConnectionWithConnectionDetails>>
  >({
    queryKey: ["project", "connections", id],
    initialData: {
      message: "Data retrieved",
      items: connections,
      pagination: calculatePagination({
        totalRecords: connections.length,
        limit: queryLimit,
        offset: 0,
      }),
    },
    queryFn: getConnections,
    refetchOnWindowFocus: false,
  });

  const handleProjectChange = (projectId: string) => {
    router.push(`/studio/project/${projectId}/connection`);
  };

  const handleConnectionChange = (connectionId: string) => {
    router.push(`/studio/project/${id}/connection/${connectionId}`);
  };

  return (
    <div className="w-full flex items-center border-b  justify-between fixed  bg-background z-[10] px-4 py-2">
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
          connection={connection}
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
              {cachedConnections.items?.map((connection) => (
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
