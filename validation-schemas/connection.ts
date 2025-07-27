import { DatabaseTypes } from "@/prisma/generated/prisma";
import z from "zod";

export const databaseProviders: DatabaseTypes[] = ["Postgres", "MySQL"];
export const createDatabaseConnectionSchema = z.object({
  name: z.string(),
  description: z.string().min(0).max(120),
  hostname: z
    .string()
    .url()
    .or(
      z
        .string()
        .regex(
          /^(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})$/,
          "Must be a valid hostname or IP address"
        )
    ),
  port: z.string().refine(
    (arg) => {
      const num = Number(arg);
      return Number.isInteger(num) && num > 0 && num <= 65535;
    },
    {
      message: "Port must be a valid integer between 1 and 65535",
    }
  ),
  ssl: z.boolean(),
  username: z.string(),
  password: z.string(),
  databaseProvider: z.enum(databaseProviders as [string, ...string[]]),
});
export const executeSqlSchema = z.object({
  sql: z
    .string()
    .trim()
    .min(1, { message: "SQL Query is to short." })
    .max(10000, {
      message:
        "Query is to long. For queries longer than 10,000 characters, consider using a Database specific tool.",
    }),
  database: z.string().optional(),
  queryId: z.string().uuid().optional(),
});
