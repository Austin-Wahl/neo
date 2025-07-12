import { DatabaseTypes } from "@/prisma/generated/prisma";

export type ExploreType = "DATABASE/TABLES" | "DATABASE/SCHEMA/TABLES";

export enum QuoteTypes {
  SINGLE = `'`,
  DOUBLE = `"`,
  BACKTICK = "`",
}

export interface SupportedDatabaseProps {
  exploreType: ExploreType;
  identifierQuote: QuoteTypes;
}

const SupportedDatabase: Record<DatabaseTypes, SupportedDatabaseProps> = {
  Postgres: {
    exploreType: "DATABASE/SCHEMA/TABLES",
    identifierQuote: QuoteTypes.DOUBLE,
  },
  MySQL: {
    exploreType: "DATABASE/TABLES",
    identifierQuote: QuoteTypes.BACKTICK,
  },
};

export default SupportedDatabase;
