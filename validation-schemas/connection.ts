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
  port: z.number(),
  ssl: z.boolean(),
  username: z.string(),
  password: z.string(),
  databaseProvider: z.enum(databaseProviders as [string, ...string[]]),
  connectionString: z.string(),
});
