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
import { Project } from "@/prisma/generated/prisma";
import { Book, Code, Download, Table, Upload, Wrench } from "lucide-react";
import Link from "next/link";

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
                    >
                      <Link
                        href={`/studio/project/${id}/connection/${connection.id}`}
                        className={`cursor-pointer`}
                      >
                        {connection.name}
                      </Link>
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
        <MenubarTrigger>Results</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Table />
            Table Layout
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <Link
            href={process.env.NEXT_PUBLIC_DOCS_LINK as string}
            target="_blank"
          >
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
