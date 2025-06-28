import CreateConnection from "@/components/custom/create-connection/create-connection";
import DBConnectionsGrid from "@/components/custom/db-connections-grid/db-connections-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { countConnections, getConnections } from "@/data-access/connection";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const ProjectPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const [connectionsError, connections] = await getConnections({
    where: {
      projectId: id,
    },
    take: 20,
  });
  const [countError, totalConnections] = await countConnections({
    projectId: id,
  });
  return (
    <div className="flex flex-col gap-4 container">
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
          />
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
