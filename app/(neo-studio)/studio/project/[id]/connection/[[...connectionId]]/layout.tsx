import Navbar from "@/components/custom/neo-studio/navbar/navbar";
import Sidebar from "@/components/custom/neo-studio/sidebar/sidebar";
import SplashScreen from "@/components/custom/neo-studio/splash-screen/splash-screen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  DatabaseConnectionWithConnectionDetails,
  getConnection,
  getConnections,
} from "@/data-access/database-connection";
import { getProjects } from "@/data-access/project";
import GridProvider from "@/providers/grid-provider";
import SqlEditorProvider from "@/providers/sql-editor-provider";
import SupportedDatabase from "@/supported-databases";
import getServerSideSession, { Session } from "@/utils/getServerSideSession";
import { AlertCircle } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";
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
  const sidebarWidth = cookieStore.get("sidebar_state_WIDTH")?.value;

  const session = await getServerSideSession();
  if (!session) redirect("/login");

  const { connectionId: connArr, id } = await params;
  const connectionId = connArr ? connArr[0] : "";

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

  const [currentConnectionError, currentConnection] = await getConnection({
    where: {
      id: connectionId,
    },
  });

  if (currentConnectionError) {
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

  const dbType = currentConnection?.databaseType;
  const exploreType = dbType
    ? SupportedDatabase[dbType].exploreType
    : undefined;
  const identifierQuote = dbType
    ? SupportedDatabase[dbType].identifierQuote
    : undefined;
  return (
    <GridProvider>
      <SqlEditorProvider>
        <SidebarProvider defaultOpen={defaultOpen} defaultWidth={sidebarWidth}>
          <Suspense fallback={<SplashScreen />}>
            <DataLoader
              connection={currentConnection ?? undefined}
              id={id}
              session={session}
            >
              <div className="w-full min-h-[calc(100vh-52px)] max-h-[calc(100%-52px)] overflow-visible flex mt-[52px] bg-backdrop">
                <Sidebar
                  className="h-full top-[53px] rounded-none"
                  connectionId={connectionId}
                  exploreType={exploreType}
                  identifierQuote={identifierQuote}
                />
                <SidebarInset className="relative h-[calc(100%-8px)] overflow-hidden w-full bg-backdrop">
                  <div className="absolute overflow-hidden w-full h-full">
                    {children}
                  </div>
                </SidebarInset>
              </div>
            </DataLoader>
          </Suspense>
        </SidebarProvider>
      </SqlEditorProvider>
    </GridProvider>
  );
}

const DataLoader = async ({
  connection,
  id,
  children,
  session,
}: {
  connection?: DatabaseConnectionWithConnectionDetails;
  id: string;
  children: ReactNode;
  session: Session;
}) => {
  const [projectsError, projects] = await getProjects({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const [connectionError, connections] = await getConnections({
    where: {
      projectId: id,
    },
  });

  if (connectionError) {
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

  return (
    <>
      <Navbar
        connections={connections!}
        id={id}
        projects={projects!}
        connection={connection ?? undefined}
      />
      {children}
    </>
  );
};
