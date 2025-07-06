"use client";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  Menubar as ShadMenubar,
} from "@/components/ui/menubar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/connection";
import useDataGrid from "@/hooks/use-datagrid";
import { Project } from "@/prisma/generated/prisma";
import {
  Book,
  Code,
  Download,
  Expand,
  Minimize,
  Table,
  Upload,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Menubar = ({
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
  const { fullScreen, setFullScreen, isActive } = useDataGrid();
  const router = useRouter();
  return (
    <ShadMenubar className="border-none">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <Link href="/">
            <MenubarItem>
              <Wrench /> Projects
            </MenubarItem>
          </Link>
          <MenubarItem>
            <Upload /> Import SQL File
          </MenubarItem>
          <MenubarItem>
            <Download /> Download Current SQL
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Current Project</MenubarSubTrigger>
            <MenubarSubContent>
              <ScrollArea className="h-[180px] overflow-y-auto">
                {projects.map((project) => {
                  return (
                    <MenubarItem
                      key={project.id}
                      className={id == project.id ? "bg-accent" : ""}
                      onClick={() =>
                        router.push(`/studio/project/${id}/connection`)
                      }
                    >
                      {project.name}
                    </MenubarItem>
                  );
                })}
              </ScrollArea>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Current Connection</MenubarSubTrigger>
            <MenubarSubContent>
              <ScrollArea className="h-[180px] overflow-y-auto">
                {connections.map((connection) => {
                  return (
                    <MenubarItem
                      key={connection.id}
                      className={
                        connectionId == connection.id ? "bg-accent" : ""
                      }
                      onClick={() =>
                        router.push(
                          `/studio/project/${id}/connection/${connection.id}`
                        )
                      }
                    >
                      {connection.name}
                    </MenubarItem>
                  );
                })}
              </ScrollArea>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Query</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Share</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={(e) => {
              e.stopPropagation();
              setFullScreen((prev) => !prev);
            }}
            disabled={!isActive}
          >
            {fullScreen ? (
              <>
                <Minimize />
                Minimize Grid
              </>
            ) : (
              <>
                <Expand />
                Expand Grid
              </>
            )}
          </MenubarItem>
          <MenubarItem disabled={!isActive}>
            <Table />
            Table Layout
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <Link href={process.env.NEXT_PUBLIC_DOCS_LINK ?? ""} target="_blank">
            <MenubarItem>
              <Book />
              Docs
            </MenubarItem>
          </Link>
          <Link href="https://www.w3schools.com/sql/" target="_blank">
            <MenubarItem>
              <Code />
              SQL
            </MenubarItem>
          </Link>
        </MenubarContent>
      </MenubarMenu>
    </ShadMenubar>
  );
};

export default Menubar;
