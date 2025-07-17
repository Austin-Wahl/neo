"use client";

import { APIResponse } from "@/app/(neo)/types/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AlertCircle, Database } from "lucide-react";
import React, { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

const DatabaseSidebar = ({
  connectionId,
  ...props
}: { connectionId: string } & React.ComponentProps<typeof Sidebar>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [databases, setDatabases] = useState<Array<string>>([]);
  async function getDatabases() {
    try {
      setLoading(true);
      setError(null);
      setDatabases([]);
      const response = await fetch(
        `/api/connection/${connectionId}/fixed-queries/databases`
      );

      const body: APIResponse<Array<string>> = await response.json();

      if (!response.ok) {
        throw body;
      }
      setDatabases(body.items!);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      setError(JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    getDatabases();
  }, []);
  return (
    <Sidebar className="top-[68px] h-[calc(100svh-68px)]! bg-red-50" {...props}>
      <SidebarContent>
        {error && (
          <div className="p-2">
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>There was an issue!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        {loading && (
          <div className="w-full h-full flex items-center justify-center">
            <PuffLoader size={16} color="white" />
          </div>
        )}
        <SidebarMenu>
          {databases.map((item) => (
            <SidebarMenuItem key={item}>
              <SidebarMenuButton asChild tooltip={item}>
                <>
                  <Database />
                  {item}
                </>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default DatabaseSidebar;
