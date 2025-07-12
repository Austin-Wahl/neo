import { DatabaseTypes } from "@/prisma/generated/prisma";
import PG from "pg";
export interface NeoAdapter {
  /**
   * Executes a database query.
   * @param sql - The SQL query string.
   * @param params - Optional parameters for the query.
   * @returns A Promise resolving to an array of rows.
   */
  query<T>(
    sql: string,
    params?: unknown[]
  ): Promise<{ rows: T[]; fields: unknown[] }>;

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

  // Retrieves a list of databases within the database server
  showDatabases(): Promise<Array<string>>;

  // Retrieves a list of schemas within the database
  showSchemas(): Promise<Array<string>>;

  // Retrieves a list of tables within the database schema
  showTables(schema: string): Promise<Array<string>>;

  // Parses query to place artifical limits on SELECT statements. Used for improving performance on the client side.
  interceptQuery(schema: string): {
    select: Array<string>;
    other: Array<string>;
  };

  /**
   * Converts error message from databases into a Neo compatible error format.
   * Do not throw errors directly, call this method to adapt errors.
   */
  #_error(error: Error, sql?: string): Error;
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

export interface NeoSqlError {
  error: string;
  errorCode: string | number;
  sql: string;
}

export type NeoConnectionOptions =
  | {
      connectionString: string;
      hostname?: undefined;
      port?: undefined;
      username?: undefined;
      password?: undefined;
      database?: undefined;
    }
  | {
      connectionString?: undefined;
      hostname: string;
      port: number;
      username: string;
      password: string;
      database?: string;
    };
