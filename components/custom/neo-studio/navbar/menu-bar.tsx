"use client";
import ManageResultsDialog from "@/components/custom/neo-studio/manage-results-dialog/manage-results-dialog";
import UpdateConnectionDialog from "@/components/custom/update-connection-dialog/update-connection-dialog";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  Menubar as ShadMenubar,
} from "@/components/ui/menubar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useDataGrid from "@/hooks/use-datagrid";
import useResultsStore from "@/hooks/use-results-store";
import useStudioLayout from "@/hooks/use-studio-layout";
import { Project } from "@/prisma/generated/prisma";
import { View } from "@/providers/studio-layout-provider";
import {
  Book,
  Bug,
  ChartArea,
  Code,
  Download,
  Folder,
  LucideProps,
  Notebook,
  Plus,
  RefreshCcw,
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
  Debug: Bug,
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
  const [queryResultsManager, setQueryResultsManager] = useState(false);
  const { addView, activeView, updateViewConfig } = useStudioLayout();
  const { setDataGridQueryId, getDataGridInstance } = useDataGrid();
  const { queryIdNameMap } = useResultsStore();

  function handlePopulateEditor() {
    const gridId = activeView?.getId();
    if (!activeView || activeView.getComponent() !== "Results") {
      console.warn(
        "Failed to populate editor. No active view of type 'Results' selected"
      );
      return;
    }

    // Create editor
    const editor = addView("Editor");

    // Get the query data from the sql editor store
    const gridInstance = getDataGridInstance(gridId!);

    if (!gridInstance) {
      console.warn(
        "Failed to populate editor. A grid instance could not be found"
      );
      return;
    }
    // Update its config to append the queryId
    updateViewConfig(editor!.getId(), { queryId: gridInstance.queryId! });
  }

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
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Query</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => addView("Editor")}>
            <Plus />
            New Query
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Results</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger
              disabled={
                activeView ? activeView.getComponent() !== "Results" : true
              }
              className={
                activeView
                  ? activeView.getComponent() !== "Results"
                    ? "text-muted-foreground cursor-not-allowed"
                    : ""
                  : "text-muted-foreground cursor-not-allowed"
              }
            >
              <RefreshCcw className="w-[16px] mr-2" />
              Sync
            </MenubarSubTrigger>
            <MenubarSubContent>
              <ScrollArea className="h-[200px]">
                {Object.keys(queryIdNameMap).length < 1 ? (
                  <MenubarItem>No Queries</MenubarItem>
                ) : null}
                {Object.keys(queryIdNameMap).map((key) => {
                  return (
                    <MenubarItem
                      key={key}
                      onClick={() => {
                        setDataGridQueryId({
                          viewId: activeView!.getId(),
                          queryId: key,
                        });
                      }}
                    >
                      {queryIdNameMap[key]}
                    </MenubarItem>
                  );
                })}
              </ScrollArea>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem
            onClick={handlePopulateEditor}
            disabled={
              activeView
                ? activeView.getComponent() !== "Results" ||
                  !getDataGridInstance(activeView.getId())?.queryId
                : true
            }
            className={
              activeView
                ? activeView.getComponent() !== "Results"
                  ? "text-muted-foreground cursor-not-allowed"
                  : ""
                : "text-muted-foreground cursor-not-allowed"
            }
          >
            <Code className="w-[16px] mr-2" />
            Populate in Editor
          </MenubarItem>
          <MenubarItem onClick={() => {setQueryResultsManager(true)}}>
            <Folder />
            Manage Results
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          {(Object.keys(viewAndIcon) as View[]).map((key, i) => {
            const Icon = viewAndIcon[key];
            if (
              key === "Debug" &&
              process.env.NEXT_PUBLIC_NODE_ENV === "production"
            )
              return null;
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
      <ManageResultsDialog
        connection={connection!}
        enableTrigger={false}
        onOpenChange={setQueryResultsManager}
        open={queryResultsManager}
      />
    </ShadMenubar>
  );
};

export default Menubar;
