// src/services/database/PostgresConnection.ts
import {
  DatabaseConnectionConfig,
  DbConnection,
  DbTransactionClient,
  NeoSqlError,
} from "@/services/types";
import {
  createPool,
  Pool,
  PoolConnection,
  PoolOptions,
  QueryError,
} from "mysql2/promise";

class MySQLTransactionClient implements DbTransactionClient {
  constructor(private client: PoolConnection) {}

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const [rows] = await this.client.query(sql, params);
    return rows as T[];
  }

  async commit(): Promise<void> {
    await this.client.commit();
    this.client.release();
  }

  async rollback(): Promise<void> {
    await this.client.rollback();
    this.client.release();
  }
}

export class MySQLConnection implements DbConnection {
  private pool: Pool;
  private config: DatabaseConnectionConfig;

  constructor(config: DatabaseConnectionConfig) {
    if (!config.connectionOptions) {
      throw new Error(
        "MySQL connection options is required. Either provide a connection string or the individual parameters."
      );
    }
    this.config = config;

    const connectionOptions: PoolOptions = {
      ...(config.connectionOptions.connectionString
        ? { uri: config.connectionOptions.connectionString }
        : {
            host: config.connectionOptions.hostname,
            port: config.connectionOptions.port,
            user: config.connectionOptions.username,
            password: config.connectionOptions.password,
            database: config.connectionOptions.database,
          }),
    };

    this.pool = createPool(connectionOptions);
  }

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const client = await this.pool.getConnection();
    try {
      const [rows] = await client.query(sql, params);
      return rows as T[];
    } catch (error) {
      // Optionally, you can check for error.code or error.sqlState here
      throw this._error(error as QueryError, sql);
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  async beginTransaction(): Promise<DbTransactionClient> {
    const client = await this.pool.getConnection();
    try {
      await client.beginTransaction();
      return new MySQLTransactionClient(client);
    } catch (error) {
      client.release();
      throw this._error(error as QueryError);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch (error) {
      console.error("MySQL test connection failed:", error);
      return false;
    }
  }

  async execute(sql: string, params?: unknown[]): Promise<number> {
    try {
      return await new Promise((resolve) => {
        console.log(sql, params);
        resolve(10);
      });
    } catch (error) {
      throw this._error(error as QueryError, sql);
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    console.log("MySQL connection pool closed.");
  }

  private _error(error: Error, sql?: string): Error {
    const mysqlError = error as QueryError;
    const errorObject = {
      error: mysqlError.message as string,
      errorCode: mysqlError.code as string,
      sql: sql as string,
    } as NeoSqlError;
    return new Error(JSON.stringify(errorObject));
  }
}
