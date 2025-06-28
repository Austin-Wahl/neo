import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getConnection } from "@/data-access/connection";
import { AlertCircle } from "lucide-react";
import { validate } from "uuid";

interface PageProps {
  params: Promise<{
    id: string;
    connectionId: string;
  }>;
}

const ConnectionWindowPage = async ({ params }: PageProps) => {
  const { id, connectionId } = await params;
  console.log({ id, connectionId });
  // Make sure the project id is valid
  if (!validate(connectionId)) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>There was an error.</AlertTitle>
          <AlertDescription>The Connection ID is not valid.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get the project
  const [connectionError, connection] = await getConnection({
    where: { id: connectionId, projectId: id },
  });
  if (connectionError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>There was an error.</AlertTitle>
          <AlertDescription>
            There was an issue retrieving data for this project. Try reloading
            the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!connection) {
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

  return <div>yay</div>;
};
export default ConnectionWindowPage;
