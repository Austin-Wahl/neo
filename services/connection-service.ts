import { DatabaseTypes } from "@/prisma/generated/prisma";
import { PostgresConnection } from "@/services/database/postgres-connection";
import { DbConnection, NeoConnectionOptions } from "@/services/types";
import { createDatabaseConnectionSchema } from "@/validation-schemas/connection";
import { z } from "zod";

/**
 * The connection service is the primary handler for determining how NEO should connect to a database.
 */
const connectionSerivce = async (
  data: z.infer<typeof createDatabaseConnectionSchema>
): Promise<DbConnection> => {
  try {
    const databaseProvider: DatabaseTypes =
      data.databaseProvider as DatabaseTypes;
    switch (databaseProvider) {
      // case "MySQL":
      //     return 1;
      case "Postgres":
        const connectionOptions: NeoConnectionOptions = {
          ...(data.connectionString
            ? {
                connectionString: data.connectionString,
              }
            : {
                hostname: data.hostname,
                password: data.password,
                port: data.port,
                username: data.username,
              }),
        };
        const connection = new PostgresConnection({
          provider: data.databaseProvider as DatabaseTypes,
          connectionOptions: connectionOptions,
          ssl: data.ssl,
        });

        return connection;
      default:
        throw new Error(
          "[NEO SERVICES | connection-service] Invalid database provider. NEO does not support " +
            data.databaseProvider
        );
    }
  } catch (error) {
    throw error;
  }
};

export default connectionSerivce;
