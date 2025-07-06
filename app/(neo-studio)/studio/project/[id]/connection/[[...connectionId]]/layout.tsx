import Navbar from "@/components/custom/neo-studio/navbar/navbar";
import Sidebar from "@/components/custom/neo-studio/sidebar/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getConnection, getConnections } from "@/data-access/connection";
import { getProjects } from "@/data-access/project";
import GridProvider from "@/providers/grid-provider";
import SqlEditorProvider from "@/providers/sql-editor-provider";
import SupportedDatabase from "@/supported-databases";
import getServerSideSession from "@/utils/getServerSideSession";
import { AlertCircle } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { validate } from "uuid";

export const metadata = {
  title: "Studio by NEO",
  description:
    "Studio is NEO's attempt at providing users with a unified relational database query and management tool.",
};

export default async function NoNavLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{
    id: string;
    connectionId?: Array<string>;
  }>;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const session = await getServerSideSession();
  if (!session) redirect("/login");

  const { connectionId: connArr, id } = await params;
  const connectionId = connArr ? connArr[0] : "";

  const [projectsError, projects] = await getProjects({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (connectionId && !validate(connectionId)) {
    return (
      <div className="w-screen h-screen flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-[400px]">
          <AlertCircle />
          <AlertTitle>There was an error.</AlertTitle>
          <AlertDescription>The Connection ID is not valid.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const [connectionError, connections] = await getConnections({
    where: {
      projectId: id,
    },
  });

  const [currentConnectionError, currentConnection] = await getConnection({
    where: {
      id: connectionId,
    },
  });

  if (connectionError || currentConnectionError) {
    return (
      <div className="w-screen h-screen flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-[400px]">
          <AlertCircle />
          <AlertTitle>There was an error.</AlertTitle>
          <AlertDescription>
            Your connections were not retrieved. Try refreshing.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="w-full h-screen flex items-center justify-center min-h-[400px] p-4 ">
        <Alert variant="destructive" className="max-w-[400px]">
          <AlertCircle />
          <AlertTitle>There was an issue loading your projects.</AlertTitle>
          <AlertDescription>
            NEO | Studio failed to load your projects. Try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const dbType = currentConnection!.databaseType;
  const exploreType = SupportedDatabase[dbType.toUpperCase()].exploreType;
  const identifierQuote =
    SupportedDatabase[dbType.toUpperCase()].identifierQuote;

  return (
    <GridProvider>
      <SqlEditorProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <Navbar
            connectionId={connectionId}
            connections={connections!}
            id={id}
            projects={projects!}
          />
          {/* <div className="w-full min-h-[calc(100vh-102px)] bg-red-500 flex mt-[102px] p-4">
        
      </div> */}
          <div className="w-full min-h-[calc(100vh-102px)] max-h-[calc(100%-102px)] overflow-visible gap-3 flex mt-[102px] pr-4">
            <Sidebar
              className="h-[calc(100%-102px)] top-[94px] ml-2"
              connectionId={connectionId}
              exploreType={exploreType}
              identifierQuote={identifierQuote}
            />
            <SidebarInset className="relative max-h-[calc(100%-16px)] overflow-hidden w-full rounded-lg">
              <div className="absolute overflow-auto w-full h-full">
                {children}
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </SqlEditorProvider>
    </GridProvider>
  );
}
