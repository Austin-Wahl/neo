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

const SupportedDatabase: Record<string, SupportedDatabaseProps> = {
  POSTGRES: {
    exploreType: "DATABASE/SCHEMA/TABLES",
    identifierQuote: QuoteTypes.DOUBLE,
  },
  MYSQL: {
    exploreType: "DATABASE/TABLES",
    identifierQuote: QuoteTypes.BACKTICK,
  },
};

export default SupportedDatabase;
