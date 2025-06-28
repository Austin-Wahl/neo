import DBConnection from "@/components/custom/db-connection/db-connection";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/connection";

const DBConnectionsGrid = ({
  connections,
}: {
  connections: Array<DatabaseConnectionWithConnectionDetails>;
  totalRecords: number;
}) => {
  return (
    <div className="flex flex-col gap-2">
      {connections.map((connection) => {
        return <DBConnection key={connection.id} connection={connection} />;
      })}
    </div>
  );
};

export default DBConnectionsGrid;
