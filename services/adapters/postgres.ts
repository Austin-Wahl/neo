// src/services/database/PostgresConnection.ts
import {
  DatabaseConnectionConfig,
  DbTransactionClient,
  NeoAdapter,
  NeoQueryResponse,
  NeoRow,
  NeoSqlError,
} from "@/services/types";
import { AST, Parser, Select } from "node-sql-parser/build/postgresql";
import {
  DatabaseError,
  Pool,
  PoolClient,
  PoolConfig,
  QueryResult,
  Result,
} from "pg";
import { Column } from "react-data-grid";
import { v4 } from "uuid";

class PostgresTransactionClient implements DbTransactionClient {
  constructor(private client: PoolClient) {}

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const res = await this.client.query(sql, params);
    return res.rows as T[];
  }

  async commit(): Promise<void> {
    await this.client.query("COMMIT");
    this.client.release();
  }

  async rollback(): Promise<void> {
    await this.client.query("ROLLBACK");
    this.client.release();
  }
}

export class PostgresAdapter implements NeoAdapter {
  private pool: Pool;
  private config: DatabaseConnectionConfig;
  private parser: Parser;

  constructor(config: DatabaseConnectionConfig) {
    if (!config.connectionOptions) {
      throw new Error(
        "Postgres connection options is required. Either provide a connection string or the individual parameters."
      );
    }
    this.config = config;
    this.parser = new Parser();

    const connectionOptions: PoolConfig = {
      ...(config.connectionOptions.connectionString
        ? { connectionString: config.connectionOptions.connectionString }
        : {
            host: config.connectionOptions.hostname,
            port: config.connectionOptions.port,
            user: config.connectionOptions.username,
            password: config.connectionOptions.password,
            ...(config.connectionOptions.database
              ? { database: config.connectionOptions.database }
              : {}),
          }),
      ...(config.ssl ? { ssl: config.ssl } : {}),
    };

    this.pool = new Pool(connectionOptions);

    // Add error listener to the pool
    this.pool.on("error", (err) => {
      throw this._error(err as DatabaseError);
      // Implement more robust error handling/monitoring here
    });
  }

  async query(sql: string, params?: unknown[]): Promise<NeoQueryResponse> {
    const start = Date.now();
    const client = await this.pool.connect(); // Get a client from the pool
    try {
      const res = await client.query(sql, params);
      const queryTime = Date.now() - start; // Calculate duration

      // In the event their is more than one select statement, return the results for the last one
      if (Array.isArray(res)) {
        const SelectArr: Result[] = res.filter((resObject: QueryResult) => {
          if (resObject.command === "SELECT") {
            return resObject;
          }
        });

        const dat = SelectArr[SelectArr.length - 1];
        const fields: Column<NeoRow>[] = dat?.fields.map((field) => {
          const name = field.name;
          return {
            name: name,
            key: name,
          };
        });

        const rows: NeoRow[] = dat?.rows.map((row) => {
          return {
            ...row,
            __neo_unique_key__: row.__neo_unique_key__
              ? row.__neo_unique_key__
              : v4(),
          };
        });

        return {
          fields,
          rows,
          metadata: {
            queryTime,
          },
        };
      }

      const fields: Column<NeoRow>[] = res.fields.map((field) => {
        const name = field.name;
        return {
          name: name,
          key: name,
        };
      });

      const rows: NeoRow[] = res.rows.map((row) => {
        return {
          ...row,
          __neo_unique_key__: row.__neo_unique_key__
            ? row.__neo_unique_key__
            : v4(),
        };
      });

      return {
        fields: fields,
        rows: rows,
        metadata: {
          queryTime,
        },
      };
    } catch (error) {
      throw this._error(error as DatabaseError, sql);
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  async beginTransaction(): Promise<DbTransactionClient> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      return new PostgresTransactionClient(client);
    } catch (error) {
      client.release(); // Ensure client is released even if BEGIN fails
      throw this._error(error as DatabaseError);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch (error) {
      console.error("PostgreSQL test connection failed:", error);
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
      throw this._error(error as DatabaseError, sql);
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    console.log("PostgreSQL connection pool closed.");
  }

  async showDatabases(): Promise<Array<string>> {
    const client = await this.pool.connect(); // Get a client from the pool
    try {
      const res = await client.query(
        "SELECT datname FROM pg_database WHERE datistemplate = false;"
      );

      return res.rows.map((databaseObject) => {
        return databaseObject.datname;
      });
    } catch (error) {
      throw this._error(error as DatabaseError);
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  async showSchemas(): Promise<Array<string>> {
    const client = await this.pool.connect(); // Get a client from the pool
    try {
      const res = await client.query(
        `SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
        ORDER BY schema_name;`
      );

      return res.rows.map((schema: { schema_name: string }) => {
        return schema.schema_name;
      });
    } catch (error) {
      throw this._error(error as DatabaseError);
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  async showTables(schema: string): Promise<Array<string>> {
    const client = await this.pool.connect(); // Get a client from the pool
    try {
      const res = await client.query(
        `SELECT tablename
        FROM pg_tables
        WHERE schemaname = $1
        ORDER BY tablename`,
        [schema]
      );

      return res.rows.map((table: { tablename: string }) => {
        return table.tablename;
      });
    } catch (error) {
      throw this._error(error as DatabaseError);
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  interceptQuery(sql: string): { select: Array<string>; other: Array<string> } {
    try {
      function modifySelectStatement(ast: Select, parser: Parser): string {
        try {
          const limit = ast.limit;

          if (limit?.value.length == 0) {
            ast.limit = {
              seperator: "LIMIT",
              value: [
                {
                  type: "number",
                  value: 1000,
                },
              ],
            };
          }
          const rawSql = parser.sqlify(ast);
          return rawSql;
        } catch (error) {
          throw error;
        }
      }

      const parsed: AST | AST[] = this.parser.astify(sql);

      const selectQueries = [];
      const otherQueries = [];

      if (Array.isArray(parsed)) {
        parsed.forEach((parse) => {
          if (parse.type === "select") {
            const _parsed = modifySelectStatement(parse, this.parser);
            selectQueries.push(_parsed);
          }

          otherQueries.push(this.parser.sqlify(parse));
        });
      } else {
        if (parsed.type === "select") {
          selectQueries.push(
            modifySelectStatement(parsed as unknown as Select, this.parser)
          );
        } else {
          otherQueries.push(sql);
        }
      }

      return {
        select: selectQueries,
        other: otherQueries,
      };
    } catch (error) {
      throw this._error(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private _error(error: Error, sql?: string): Error {
    const mysqlError = error as DatabaseError;
    const errorObject = {
      error: mysqlError.message as string,
      errorCode: mysqlError.code as string,
      sql: sql as string,
    } as NeoSqlError;
    return new Error(JSON.stringify(errorObject));
  }
}
