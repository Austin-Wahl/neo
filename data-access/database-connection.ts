import { DataAccessResponse } from "@/data-access/data-access";
import { prisma } from "@/lib/prisma";
import {
  Connection,
  DatabaseConnection,
  Prisma,
} from "@/prisma/generated/prisma";

const databaseConnectionWithConnectionDetails: Prisma.DatabaseConnectionInclude =
  {
    connection: {
      select: {
        id: true,
        hostname: true,
        port: true,
        ssl: true,
        username: true,
        password: true,
      },
    },
  };

export type DatabaseConnectionWithConnectionDetails =
  Prisma.DatabaseConnectionGetPayload<{
    include: typeof databaseConnectionWithConnectionDetails;
  }>;

// DAL Function for creating a new database connection
export const createConnection = async (opts: {
  databaseConnection: Pick<
    DatabaseConnection,
    "name" | "ownerId" | "databaseType" | "description" | "projectId"
  >;
  connection: Pick<
    Connection,
    "hostname" | "password" | "port" | "ssl" | "username"
  >;
}): DataAccessResponse<DatabaseConnectionWithConnectionDetails> => {
  try {
    const data = await prisma.$transaction(async () => {
      const databaseConnection = await prisma.databaseConnection.create({
        data: opts.databaseConnection,
      });

      await prisma.connection.create({
        data: {
          databaseType: opts.databaseConnection.databaseType,
          databaseConnectionId: databaseConnection.id,
          projectId: opts.databaseConnection.projectId,
          ...opts.connection,
        },
      });

      const res = await prisma.databaseConnection.findUnique({
        where: {
          id: databaseConnection.id,
        },
        include: databaseConnectionWithConnectionDetails,
      });

      return res;
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// DAL Function for deleting a new database connection
export const deleteConnection = async (
  id: string
): DataAccessResponse<boolean> => {
  try {
    await prisma.databaseConnection.delete({
      where: {
        id: id,
      },
    });

    return [null, true];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// DAL Function for retrieving a database connections
export const getConnection = async (
  opts: Prisma.DatabaseConnectionFindManyArgs
): DataAccessResponse<DatabaseConnectionWithConnectionDetails> => {
  try {
    const data = await prisma.databaseConnection.findFirst({
      where: opts.where,
      ...opts,
      include: {
        ...opts.include,
        ...databaseConnectionWithConnectionDetails,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// DAL Function for retrieving many database connections
export const getConnections = async (
  opts: Prisma.DatabaseConnectionFindManyArgs
): DataAccessResponse<Array<DatabaseConnectionWithConnectionDetails>> => {
  try {
    const data = await prisma.databaseConnection.findMany({
      where: opts.where,
      ...opts,
      include: {
        ...opts.include,
        ...databaseConnectionWithConnectionDetails,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// DAL Function for counting connections
export const countConnections = async (
  opts: Prisma.DatabaseConnectionWhereInput
): DataAccessResponse<number> => {
  try {
    const data = await prisma.databaseConnection.count({
      where: opts,
    });

    return [null, data];
  } catch (error) {
    console.log("[DATA ACCESS | countConnections]", error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
