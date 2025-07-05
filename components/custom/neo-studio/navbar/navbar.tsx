"use client";

import Menubar from "@/components/custom/neo-studio/navbar/menu-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/connection";
import { Project } from "@/prisma/generated/prisma";
import { useRouter } from "next/navigation";

const Navbar = ({
  projects,
  connections,
  connectionId,
  id,
}: {
  projects: Array<Project>;
  connections: Array<DatabaseConnectionWithConnectionDetails>;
  connectionId: string;
  id: string;
}) => {
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
            <SelectValue placeholder="Connection" />
          </SelectTrigger>
          <SelectContent>
            {connections?.map((connection) => (
              <SelectItem value={connection.id} key={connection.id}>
                {connection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Navbar;
