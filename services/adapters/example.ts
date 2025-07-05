// import { DbTransactionClient, NeoAdapter } from "@/services/types";
// class ExampleTransactionClient implements DbTransactionClient {
//   constructor(private client) {}

//   async query<T>(sql: string, params?: unknown[]): Promise<T[]> {}

//   async commit(): Promise<void> {}

//   async rollback(): Promise<void> {}
// }
// export class ExampleAdapter implements NeoAdapter {
//   beginTransaction(): Promise<DbTransactionClient> {}
//   close(): Promise<void> {}
//   execute(sql: string, params?: unknown[]): Promise<number> {}
//   query<T>(sql: string, params?: unknown[]): Promise<T[]> {}
//   testConnection(): Promise<boolean> {}
// }
