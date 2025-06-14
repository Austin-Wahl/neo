import { DatabaseTypes } from "@/prisma/generated/prisma";
import PG from "pg";
export interface DbConnection {
  /**
   * Executes a database query.
   * @param sql - The SQL query string.
   * @param params - Optional parameters for the query.
   * @returns A Promise resolving to an array of rows.
   */
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Begins a database transaction.
   * @returns A Promise resolving to a transaction client.
   */
  beginTransaction(): Promise<DbTransactionClient>;

  /**
   * Tests the database connection.
   * @returns A Promise resolving to true if the connection is successful, false otherwise.
   */
  testConnection(): Promise<boolean>;

  /**
   * Closes the underlying database connection pool or client.
   * (Important for graceful shutdown or when switching connections)
   */
  close(): Promise<void>;

  // getSchema(): Promise<DatabaseSchema>;
  execute(sql: string, params?: unknown[]): Promise<number>; // For non-SELECT operations returning row count
}

// For transactions, we also need a client interface within the transaction
export interface DbTransactionClient {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export type DatabaseConnectionConfig = {
  provider: DatabaseTypes;
  connectionOptions: NeoConnectionOptions;
  ssl?: PgSslConfig;
};

type PgSslConfig = PG.ClientConfig["ssl"];

export type NeoConnectionOptions =
  | {
      connectionString: string;
      hostname?: undefined;
      port?: undefined;
      username?: undefined;
      password?: undefined;
    }
  | {
      connectionString?: undefined;
      hostname: string;
      port: number;
      username: string;
      password: string;
    };
