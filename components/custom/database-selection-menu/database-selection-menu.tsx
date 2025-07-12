"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/prisma/generated/prisma";
import { redirect } from "next/navigation";

const DatabaseSelectionMenu = ({
  project,
  defaultValue,
}: {
  project: Project & {
    DatabaseConnection: Array<{ id: string; name: string }>;
  };
  defaultValue: string;
}) => {
  return (
    <Select
      defaultValue={defaultValue}
      onValueChange={(value) =>
        redirect(`/studio/project/${project.id}/connection/${value}`)
      }
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Connection" />
      </SelectTrigger>
      <SelectContent>
        {project.DatabaseConnection.map((databaseConnection) => {
          return (
            <SelectItem
              key={databaseConnection.id}
              value={databaseConnection.id}
            >
              {databaseConnection.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default DatabaseSelectionMenu;
