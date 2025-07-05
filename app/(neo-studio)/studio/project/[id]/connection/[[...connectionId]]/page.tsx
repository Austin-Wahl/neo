import DatabaseSelectionMenu from "@/components/custom/database-selection-menu/database-selection-menu";
import Studio from "@/components/custom/neo-studio/STUDIO/studio";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getConnection } from "@/data-access/connection";
import { getProject } from "@/data-access/project";
import { Project } from "@/prisma/generated/prisma";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
    connectionId?: Array<string>;
  }>;
}

const ConnectionWindowPage = async ({ params }: PageProps) => {
  const { id, connectionId: connIdArr } = await params;
  const connectionId = connIdArr ? connIdArr[0] : "";

  const [projectError, project] = (await getProject({
    where: { id: id },
    include: {
      DatabaseConnection: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })) as [
    Error | null,
    (
      | (Project & { DatabaseConnection: Array<{ id: string; name: string }> })
      | null
    )
  ];
  if (projectError) {
    return (
      <div className="w-full h-[calc(100vh-68px)] flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-[400px]">
          <AlertCircle />
          <AlertTitle>Failed to load</AlertTitle>
          <AlertDescription>
            Your project could not be loaded. Try refreshing.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-[400px]">
          <AlertCircle />
          <AlertTitle>No Project Found</AlertTitle>
          <AlertDescription>
            There is not a project which exists with the provided ID.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!connectionId) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-[500px]">
          <CardHeader>
            <CardTitle>Studio by NEO</CardTitle>
            <CardDescription>
              Studio is a GUI which enables developers and database
              administrators to easily query and view database statistics,
              tables, and of course, data.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            To use Studio, please select a database connection from the menu
            above, or, use the dropdown below.
            <DatabaseSelectionMenu project={project} defaultValue="" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the project and connection
  const [connectionError, connection] = await getConnection({
    where: { id: connectionId, projectId: id },
  });

  if (connectionError) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-[400px]">
          <AlertCircle />
          <AlertTitle>No Project Found</AlertTitle>
          <AlertDescription>
            There is not a project which exists with the provided ID.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!connection || !project) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>No Connection Found!</AlertTitle>
          <AlertDescription>
            This project does not have an associated project with the provided
            ID.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Studio connection={connection} />
      {/* <div className="w-[50px] h-[10000px]"></div> */}
    </div>
  );
};

export default ConnectionWindowPage;
