import { DatabaseTypes } from "@/prisma/generated/prisma";
// import { MySQLAdapter } from "@/services/adapters/mysql";
import { PostgresAdapter } from "@/services/adapters/postgres";
import { NeoAdapter, NeoConnectionOptions } from "@/services/types";
import { createDatabaseConnectionSchema } from "@/validation-schemas/connection";
import { z } from "zod";

type NeoConnectionInitProps = Pick<
  z.infer<typeof createDatabaseConnectionSchema>,
  "databaseProvider" | "hostname" | "password" | "port" | "ssl" | "username"
>;

class NeoConnection {
  private connection: NeoAdapter | undefined;

  constructor() {}

  async init(data: NeoConnectionInitProps) {
    this.connection = await this.connectionSerivceController(data);
  }

  getConnection(): NeoAdapter {
    try {
      if (!this.connection)
        throw new Error(
          "[NEO SERVICES | get-connection] Connection is undefined. Please call init() to establish a connection."
        );

      return this.connection;
    } catch (error) {
      throw error;
    }
  }

  private connectionSerivceController = async (
    data: NeoConnectionInitProps
  ): Promise<NeoAdapter> => {
    try {
      const databaseProvider: DatabaseTypes =
        data.databaseProvider as DatabaseTypes;
      const connectionOptions: NeoConnectionOptions = {
        hostname: data.hostname,
        password: data.password,
        port: Number(data.port),
        username: data.username,
      };

      switch (databaseProvider) {
        case "MySQL":
          const mysqlConnection = new PostgresAdapter({
            provider: data.databaseProvider as DatabaseTypes,
            connectionOptions: connectionOptions,
            ssl: data.ssl,
          });

          return mysqlConnection;
        case "Postgres":
          const postgresConnection = new PostgresAdapter({
            provider: data.databaseProvider as DatabaseTypes,
            connectionOptions: connectionOptions,
            ssl: data.ssl,
          });

          return postgresConnection;
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
}

export default NeoConnection;
