"use client";

import { APIResponse } from "@/app/(neo)/types/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useStudioLayout from "@/hooks/use-studio-layout";
import { cn } from "@/lib/utils";
import { SupportedDatabaseProps } from "@/supported-databases";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircleIcon,
  ChevronRight,
  Database,
  Edit,
  Map,
  Plus,
  RefreshCw,
  Split,
  Table,
  Trash,
} from "lucide-react";
import { ReactNode, useState } from "react";

type SidebarProps = React.ComponentProps<typeof ShadSidebar> & {
  dbProps: {
    connectionId?: string;
  } & Partial<SupportedDatabaseProps>;
};

type SidebarProps_DBConnected = React.ComponentProps<typeof ShadSidebar> & {
  dbProps: {
    connectionId: string;
  } & SupportedDatabaseProps;
};

const Sidebar = ({ dbProps, ...props }: SidebarProps) => {
  const { open } = useSidebar();

  if (!dbProps.connectionId) {
    return (
      <ShadSidebar variant="sidebar" {...props} collapsible="icon">
        <SidebarRail />
        <SidebarHeader>
          <div
            className={`flex items-center ${
              open
                ? "flex-row justify-between p-2 bg-secondary rounded-md"
                : "flex-col-reverse justify-center border-b pb-2 gap-2"
            }`}
          >
            <SidebarTrigger>
              <Split />
            </SidebarTrigger>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {open && (
            <div className="p-2">
              <Alert variant="default">
                <AlertCircleIcon className="mr-2" />
                <AlertTitle>No Connection</AlertTitle>
                <AlertDescription>
                  To use studio, please choose a connection.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </SidebarContent>
      </ShadSidebar>
    );
  }

  return (
    <Sidebar_DBConnected
      dbProps={{
        connectionId: dbProps.connectionId,
        exploreType: dbProps.exploreType!,
        identifierQuote: dbProps.identifierQuote!,
      }}
      {...props}
    />
  );
};

const Sidebar_DBConnected = ({
  dbProps,
  ...props
}: SidebarProps_DBConnected) => {
  const [error, setError] = useState("");
  const { open } = useSidebar();
  const { data, status, refetch, isRefetching } = useQuery<
    APIResponse<Array<string>>
  >({
    queryKey: ["databases", dbProps.connectionId],
    queryFn: getDatabases,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
  async function getDatabases(): Promise<APIResponse<Array<string>>> {
    try {
      setError("");

      const response = await fetch(
        `/api/connection/${dbProps.connectionId}/fixed-queries/databases`
      );

      const body: APIResponse<Array<string>> = await response.json();

      if (!response.ok) {
        throw body;
      }

      return body;
    } catch (error) {
      console.log(error);

      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        setError("There was an issue!");
        throw error;
      }
    }
  }

  return (
    <ShadSidebar variant="sidebar" {...props} collapsible="icon">
      <SidebarRail />
      <SidebarHeader className="!bg-background border-b">
        <div
          className={`flex items-center ${
            open
              ? "flex-row justify-between bg-background rounded-md"
              : "flex-col-reverse justify-center  pb-2 gap-2"
          }`}
        >
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("size-7 cursor-pointer")}
                  onClick={() => refetch()}
                >
                  <RefreshCw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div>
            <SidebarTrigger>
              <Split />
            </SidebarTrigger>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="!bg-background">
        {status === "error" && (
          <div className="p-2">
            <Alert variant="destructive">
              <AlertCircleIcon className="mr-2" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <SidebarGroup className="h-full">
          <SidebarGroupAction>
            <Plus />
          </SidebarGroupAction>
          <ContextMenu modal={status === "success"}>
            <ContextMenuTrigger className="">
              <SidebarGroupLabel>Databases</SidebarGroupLabel>
            </ContextMenuTrigger>

            <ContextMenuContent>
              <ContextMenuItem onClick={() => refetch()}>
                <RefreshCw /> Refresh
              </ContextMenuItem>
              <ContextMenuItem>
                <Plus /> Add Database
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {status === "pending" || isRefetching
            ? Array.from({ length: 5 }).map((_, index) => (
                <SidebarMenuItem key={index} className="list-none">
                  {open ? (
                    <SidebarMenuSkeleton />
                  ) : (
                    <Skeleton className="w-full h-[30px] mt-2" />
                  )}
                </SidebarMenuItem>
              ))
            : null}

          {status === "success" &&
            !isRefetching &&
            data.items!.map((database) => {
              return (
                <DatabaseExplorer
                  exploreType={dbProps.exploreType}
                  database={database}
                  key={database}
                  connectionId={dbProps.connectionId}
                  identifierQuote={dbProps.identifierQuote}
                />
              );
            })}

          {status === "success" &&
            !isRefetching &&
            data.items!.length === 0 && (
              <SidebarMenuItem>
                <Alert>
                  <Database className="mr-2" />
                  <AlertTitle>No Databases</AlertTitle>
                </Alert>
              </SidebarMenuItem>
            )}
        </SidebarGroup>
      </SidebarContent>
    </ShadSidebar>
  );
};

const DatabaseExplorer = ({
  exploreType,
  identifierQuote,
  database,
  connectionId,
}: {
  connectionId: string;
  database: string;
} & SupportedDatabaseProps) => {
  // Different Databases are "explored" different. Some return schemas and some return databases and tables
  // The type of explore required will determine the UI

  if (exploreType === "DATABASE/SCHEMA/TABLES") {
    return (
      <DatabaseSchema
        connectionId={connectionId}
        database={database}
        exploreType={exploreType}
        identifierQuote={identifierQuote}
      />
    );
  }

  if (exploreType === "DATABASE/TABLES") {
    return (
      <SchemaTable
        connectionId={connectionId}
        database={database}
        schema={database}
        icon={<Database />}
        exploreType={exploreType}
        identifierQuote={identifierQuote}
      />
    );
  }
};

const DatabaseSchema = ({
  database,
  connectionId,
  identifierQuote,
  exploreType,
}: {
  database: string;
  connectionId: string;
} & SupportedDatabaseProps) => {
  const [error, setError] = useState("");
  const { open } = useSidebar();
  const [init, setInit] = useState(false);

  const { data, refetch, isRefetching, isRefetchError, status } = useQuery({
    queryKey: ["connections", "schemas", connectionId, database],
    queryFn: getDatabaseSchemas,
    enabled: false,
  });

  async function getDatabaseSchemas() {
    try {
      setError("");

      const response = await fetch(
        `/api/connection/${connectionId}/fixed-queries/databases/${database}/schemas`
      );

      const body: APIResponse<Array<string>> = await response.json();

      if (!response.ok) {
        throw body;
      }

      return body;
    } catch (error) {
      console.log(error);

      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        setError("There was an issue!");
        throw error;
      }
    }
  }
  return (
    <ContextMenu>
      <Collapsible
        defaultOpen={false}
        className="group/collapsible_db"
        key={database}
        onOpenChange={(open) => {
          if (init || !open) return;

          setInit(true);
          refetch();
        }}
      >
        <ContextMenuTrigger asChild>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={database}>
              <Database />
              {database}
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible_db:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </ContextMenuTrigger>
        <CollapsibleContent>
          {status === "pending" || isRefetching
            ? Array.from({ length: 5 }).map((_, index) => (
                <SidebarMenuSubItem key={index} className="list-none">
                  {open ? <SidebarMenuSkeleton /> : null}
                </SidebarMenuSubItem>
              ))
            : null}
          <SidebarMenuSub>
            {status === "error" || isRefetchError ? (
              <Alert variant="destructive">
                <AlertCircleIcon className="mr-2" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {status === "success" && !isRefetching
              ? data.items!.map((schema, i) => {
                  return (
                    <SchemaTable
                      key={i}
                      connectionId={connectionId}
                      database={database}
                      schema={schema}
                      exploreType={exploreType}
                      identifierQuote={identifierQuote}
                    />
                  );
                })
              : null}
            {status === "success" &&
              !isRefetching &&
              data.items!.length === 0 && (
                <Alert>
                  <Database className="mr-2" />
                  <AlertTitle>No Schemas</AlertTitle>
                </Alert>
              )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => refetch()}>
          <RefreshCw /> Refresh
        </ContextMenuItem>
        <ContextMenuItem>
          <Edit /> Rename
        </ContextMenuItem>
        <ContextMenuItem variant="destructive">
          <Trash /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

const SchemaTable = ({
  database,
  schema,
  connectionId,
  icon,
  identifierQuote,
}: {
  database: string;
  schema: string;
  connectionId: string;
  icon?: ReactNode;
} & SupportedDatabaseProps) => {
  const { addView, updateViewConfig } = useStudioLayout();
  const [error, setError] = useState("");
  const { open } = useSidebar();
  const [init, setInit] = useState(false);

  const { data, refetch, isRefetching, isRefetchError, status } = useQuery({
    queryKey: [
      "connections",
      "schemas",
      "tables",
      connectionId,
      database,
      schema,
    ],
    queryFn: getDatabaseSchemas,
    enabled: false,
  });

  async function getDatabaseSchemas() {
    try {
      setError("");

      const response = await fetch(
        `/api/connection/${connectionId}/fixed-queries/databases/${database}/schemas/${schema}`
      );

      const body: APIResponse<Array<string>> = await response.json();

      if (!response.ok) {
        throw body;
      }

      return body;
    } catch (error) {
      console.log(error);

      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        setError("There was an issue!");
        throw error;
      }
    }
  }

  function handleSidebarElmClick(item: string) {
    // Create an editor
    const editor = addView("Editor")!;
    updateViewConfig(editor.getId(), {
      sql: `SELECT * FROM ${schema}.${identifierQuote}${item}${identifierQuote}`,
      database: database,
    });
  }

  return (
    <ContextMenu>
      <Collapsible
        defaultOpen={false}
        className="group/collapsible"
        key={database}
        onOpenChange={(open) => {
          if (init || !open) return;

          setInit(true);
          refetch();
        }}
      >
        <ContextMenuTrigger asChild>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={schema}>
              {icon ? icon : <Map />}
              {schema}
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </ContextMenuTrigger>
        <CollapsibleContent>
          {status === "pending" || isRefetching
            ? Array.from({ length: 5 }).map((_, index) => (
                <SidebarMenuSubItem key={index} className="list-none">
                  {open ? <SidebarMenuSkeleton /> : null}
                </SidebarMenuSubItem>
              ))
            : null}
          <SidebarMenuSub>
            {status === "error" || isRefetchError ? (
              <Alert variant="destructive">
                <AlertCircleIcon className="mr-2" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {status === "success" && !isRefetching
              ? data.items!.map((item, i) => {
                  return (
                    <SidebarMenuSubButton
                      className="overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer select-none"
                      key={i}
                      onClick={() => {
                        handleSidebarElmClick(item);
                      }}
                    >
                      <Table />
                      {item}
                    </SidebarMenuSubButton>
                  );
                })
              : null}
            {status === "success" &&
              !isRefetching &&
              data.items!.length === 0 && (
                <Alert>
                  <Database className="mr-2" />
                  <AlertTitle>No Tables</AlertTitle>
                </Alert>
              )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => refetch()}>
          <RefreshCw /> Refresh
        </ContextMenuItem>
        <ContextMenuItem>
          <Edit /> Rename
        </ContextMenuItem>
        <ContextMenuItem variant="destructive">
          <Trash /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Sidebar;
