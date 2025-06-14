import DBConnection from "@/components/custom/db-connection/db-connection";
import { DatabaseConnection } from "@/prisma/generated/prisma";

const DBConnectionsGrid = ({
  connections,
}: {
  connections: Array<DatabaseConnection>;
}) => {
  return (
    <div className="flex gap-4 flex-wrap">
      {connections.map((connection) => {
        return <DBConnection key={connection.id} connection={connection} />;
      })}
    </div>
  );
};

export default DBConnectionsGrid;
