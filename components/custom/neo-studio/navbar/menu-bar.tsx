"use client";
import UpdateConnectionDialog from "@/components/custom/update-connection-dialog/update-connection-dialog";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  Menubar as ShadMenubar,
} from "@/components/ui/menubar";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useStudioLayout from "@/hooks/use-studio-layout";
import { Project } from "@/prisma/generated/prisma";
import { View } from "@/providers/studio-layout-provider";
import {
  Book,
  ChartArea,
  Code,
  Download,
  LucideProps,
  Notebook,
  Settings,
  Table,
  Upload,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes, useState } from "react";

const viewAndIcon: Record<
  View,
  ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
> = {
  Editor: Code,
  Graph: ChartArea,
  Results: Table,
  Scratchpad: Notebook,
};
const Menubar = ({
  connection,
}: {
  projects: Array<Project>;
  connections: Array<DatabaseConnectionWithConnectionDetails>;
  connectionId?: string;
  connection?: DatabaseConnectionWithConnectionDetails;
  id: string;
}) => {
  const [editConnection, setEditConnection] = useState(false);
  const { addView } = useStudioLayout();

  return (
    <ShadMenubar className="border-none">
      <MenubarMenu>
        <MenubarTrigger>Connection</MenubarTrigger>
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
          <MenubarItem
            disabled={connection ? false : true}
            onClick={() => setEditConnection(true)}
          >
            <Settings />
            Configure Connection
          </MenubarItem>
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
          {(Object.keys(viewAndIcon) as View[]).map((key, i) => {
            const Icon = viewAndIcon[key];
            return (
              <MenubarItem key={i} onClick={() => addView(key)}>
                <Icon /> {key}
              </MenubarItem>
            );
          })}
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
        {editConnection && connection !== undefined ? (
          <UpdateConnectionDialog
            connection={connection}
            enableTrigger={false}
            open={editConnection}
            onOpenChange={setEditConnection}
          />
        ) : null}
      </MenubarMenu>
    </ShadMenubar>
  );
};

export default Menubar;
