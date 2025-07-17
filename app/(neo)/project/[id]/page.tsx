import CreateConnection from "@/components/custom/create-connection/create-connection";
import DBConnectionsGrid from "@/components/custom/db-connections-grid/db-connections-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  countConnections,
  getConnections,
} from "@/data-access/database-connection";
import { AlertCircle, Database, Plus } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const ProjectPage = async ({ params }: PageProps) => {
  const { id } = await params;

  return <Connections id={id} />;
};

const Connections = async ({ id }: { id: string }) => {
  const [connectionsError, connections] = await getConnections({
    where: {
      projectId: id,
    },
    orderBy: {
      name: "asc",
    },
    take: 20,
  });

  const [countError, totalConnections] = await countConnections({
    projectId: id,
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      <CreateConnectionBanner id={id} />

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
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-lg">Existing Connections</p>
            <DBConnectionsGrid
              connections={connections!}
              totalRecords={totalConnections as number}
              projectId={id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const CreateConnectionBanner = ({ id }: { id: string }) => {
  return (
    <div className="w-full p-4 rounded-lg bg-gradient-to-r from-card to-background border flex flex-col gap-2 justify-center">
      <div className="w-[60px] h-[60px] flex items-center justify-center rounded-lg bg-background">
        <Database width={16} />
      </div>
      <div>
        <p className="text-lg">Add Connection</p>
        <p className="text-sm text-muted-foreground">
          Connect to a new database instance. Choose from PostgreSQL, MySQL, or
          other supported databases.
        </p>
      </div>
      <div className="mt-4">
        <CreateConnection
          projectId={id}
          asChild
          trigger={
            <Button className="cursor-pointer">
              <Plus />
              Add
            </Button>
          }
        />
      </div>
    </div>
  );
};
export default ProjectPage;
