import { APIResponse } from "@/app/(neo)/types/types";
import { getConnection } from "@/data-access/connection";
import NeoConnection from "@/services/connection-service";
import { NeoSqlError } from "@/services/types";
import getServerSideSession from "@/utils/getServerSideSession";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";
import { z } from "zod";

interface TestConnectionRouteParams {
  params: Promise<{
    id: string;
    database: string;
    schema: string;
  }>;
}

export const GET = async (
  request: NextRequest,
  { params }: TestConnectionRouteParams
) => {
  try {
    // Make sure user is authenticated
    const session = await getServerSideSession();
    if (!session) {
      return NextResponse.json(
        {
          message: "You need to login!",
          error:
            "This is a protected resource. Please authenticate your request first.",
        } as APIResponse,
        { status: 401 }
      );
    }

    // Get the route params
    const { id, database, schema } = await params;
    if (!validate(id)) {
      return NextResponse.json(
        {
          message: "Malformed Connection ID",
          error: "Connection ID is not a valid UUID",
        } as APIResponse,
        { status: 400 }
      );
    }

    const error = z
      .object({
        database: z.string({ message: "Invalid database name" }),
        schema: z.string({ message: "Invalid schema name" }),
      })
      .safeParse({
        database,
        schema,
      });
    if (!error.success) {
      return NextResponse.json(
        {
          message: "Invalid database or schema name.",
          error:
            "Failed to pass validation with provided database and schema names.",
          zodValidationDetails: error.error.flatten(),
        } as APIResponse,
        { status: 400 }
      );
    }
    // Get the connection
    const [connectionError, connection] = await getConnection({
      where: {
        id: id,
        ownerId: session.user.id,
      },
    });
    if (connectionError) throw connectionError;
    if (!connection) {
      return NextResponse.json(
        {
          message: "A connection with the provided ID could not be found.",
          error:
            "NEO does not have a record of a connection with the provided ID.",
        } as APIResponse,
        { status: 404 }
      );
    }

    const neo = new NeoConnection();
    await neo.init({
      databaseProvider: connection.databaseType,
      hostname: connection.connection!.hostname,
      password: connection.connection!.password as string,
      port: connection.connection!.port,
      ssl: connection.connection!.ssl,
      username: connection.connection!.username,
      database: database,
    });
    const connectionInstance = neo.getConnection();
    const connected = await connectionInstance.testConnection();

    if (!connected) {
      return NextResponse.json(
        {
          message: "NEO failed to establish a connection.",
          error: "NEO failed to establish a connection.",
          data: {
            connectionStatus: connected,
          },
        } as APIResponse<{ connectionStatus: boolean }>,
        { status: 400 }
      );
    }

    try {
      const results = await connectionInstance.showTables(schema);
      return NextResponse.json(
        {
          message: "Query executed successfully!",
          items: results,
        } as APIResponse<Array<string>>,
        { status: 200 }
      );
    } catch (error) {
      const errorMessage: NeoSqlError = JSON.parse((error as Error).message);
      console.log(errorMessage);
      return NextResponse.json(
        {
          message: "Query failed!",
          error: errorMessage,
        } as APIResponse,
        { status: 400 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message:
          "There was an internal error. Connection status was not checked.",
        error:
          "There was an issue establishing a connection. This is a issue with NEO and not with the DB Service Provider.",
      } as APIResponse,
      { status: 500 }
    );
  }
};
