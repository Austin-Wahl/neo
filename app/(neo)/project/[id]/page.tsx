import CreateConnection from "@/components/custom/create-connection/create-connection";
import DBConnectionsGrid from "@/components/custom/db-connections-grid/db-connections-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  countConnections,
  getConnections,
} from "@/data-access/database-connection";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";
import { PuffLoader } from "react-spinners";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const ProjectPage = async ({ params }: PageProps) => {
  const { id } = await params;

  return (
    <Suspense fallback={<PuffLoader color="var(--foreground)" />}>
      <Connections id={id} />
    </Suspense>
  );
};

const Connections = async ({ id }: { id: string }) => {
  const [connectionsError, connections] = await getConnections({
    where: {
      projectId: id,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 20,
  });
  console.log(connections);
  const [countError, totalConnections] = await countConnections({
    projectId: id,
  });

  return (
    <div className="flex flex-col gap-4 container p-4">
      <CreateConnection projectId={id} />
      <div>
        {connectionsError || countError ? (
          <Alert variant={"destructive"}>
            <AlertCircle />
            <AlertTitle>Something went wrong.</AlertTitle>
            <AlertDescription>
              NEO failed to retrieve your project&apos;s connections.
            </AlertDescription>
          </Alert>
        ) : (
          <DBConnectionsGrid
            connections={connections!}
            totalRecords={totalConnections as number}
            projectId={id}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
