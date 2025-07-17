import { APIResponse } from "@/app/(neo)/types/types";
import {
  DatabaseConnectionWithConnectionDetails,
  deleteConnection,
  getConnection,
  updateConnection,
} from "@/data-access/database-connection";
import NeoConnection from "@/services/connection-service";
import getServerSideSession from "@/utils/getServerSideSession";
import { createDatabaseConnectionSchema } from "@/validation-schemas/connection";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";
import z from "zod";

interface ProjectConnectionRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export const DELETE = async (
  request: NextRequest,
  { params }: ProjectConnectionRouteProps
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
    const { id } = await params;
    if (!validate(id)) {
      return NextResponse.json(
        {
          message: "Malformed Connection ID",
          error: "Project ID is not a valid UUID",
        } as APIResponse,
        { status: 400 }
      );
    }

    // Find the project
    const [projectError, connection] = await getConnection({
      where: { id: id },
      include: { project: { select: { ownerId: true } } },
    });
    if (projectError) throw projectError;

    if (!connection) {
      return NextResponse.json(
        {
          message: "This connection does not exist.",
          error: "A project with the provided UUID could not be found.",
        } as APIResponse,
        { status: 404 }
      );
    }

    // Make sure the user has access to the project
    if (connection.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          message: "You do not have access to this connection.",
          error:
            "You do not have access to view this connection. Contact the Project Owner if you believe you should.",
        } as APIResponse,
        { status: 403 }
      );
    }

    const [connectionError, deleted] = await deleteConnection(connection.id);
    if (connectionError) throw connectionError;

    return NextResponse.json(
      {
        message: "Connection Deleted",
        data: deleted,
      } as APIResponse<boolean>,
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an internal error. Your connection was not deleted",
        error:
          "There was an issue establishing a connection. This is a issue with NEO and not with the DB Service Provider.",
      } as APIResponse,
      { status: 500 }
    );
  }
};

export const PATCH = async (
  request: NextRequest,
  { params }: ProjectConnectionRouteProps
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
    const { id } = await params;
    if (!validate(id)) {
      return NextResponse.json(
        {
          message: "Malformed Connection ID",
          error: "Project ID is not a valid UUID",
        } as APIResponse,
        { status: 400 }
      );
    }
    // Get the body and validate it
    const updateSchema = createDatabaseConnectionSchema.partial();

    const body: z.infer<typeof updateSchema> = await request.json();
    const validation = updateSchema.safeParse(body);
    // Find the project
    const [projectError, connection] = await getConnection({
      where: { id: id },
      include: { project: { select: { ownerId: true } } },
    });

    if (projectError) throw projectError;

    if (!connection) {
      return NextResponse.json(
        {
          message: "This connection does not exist.",
          error: "A project with the provided UUID could not be found.",
        } as APIResponse,
        { status: 404 }
      );
    }

    // Make sure the user has access to the project
    if (connection.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          message: "You do not have access to this connection.",
          error:
            "You do not have access to view this connection. Contact the Project Owner if you believe you should.",
        } as APIResponse,
        { status: 403 }
      );
    }
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Your request is malformed.",
          error: "Request body did not pass validation.",
          zodValidationDetails: validation.error?.flatten(),
        } as APIResponse,
        { status: 400 }
      );
    }

    const checkConnectionIfPopulated: Array<
      "databaseProvider" | "hostname" | "password" | "port" | "ssl" | "username"
    > = ["databaseProvider", "hostname", "password", "port", "ssl", "username"];

    // If the body contains any information requiring the connection to be checked, then check the connection.
    // Neo does not save any connection information, if it can't ping the database
    if (
      Object.keys(body).some((key) =>
        checkConnectionIfPopulated.includes(
          key as (typeof checkConnectionIfPopulated)[number]
        )
      )
    ) {
      const neo = new NeoConnection();
      await neo.init({
        databaseProvider: body.databaseProvider || connection.databaseType,
        hostname: body.hostname || connection.connection!.hostname,
        password: body.password || (connection.connection!.password ?? ""),
        port: body.port || connection.connection!.port,
        ssl: body.ssl || connection.connection!.ssl,
        username: body.username || connection.connection!.username,
      });

      const neoConnection = neo.getConnection();
      const connectedToServiceProvider = await neoConnection.testConnection();

      if (!connectedToServiceProvider) {
        return NextResponse.json(
          {
            message: "Failed to establish a connection.",
            error:
              "NEO failed to connect to the database with the provided credentials. Please ensure the hostname, port, and password are correct.",
          } as APIResponse,
          { status: 400 }
        );
      }
    }

    const [connectionError, updated] = await updateConnection({
      id: id,
      ...(body.hostname ? { hostname: body.hostname } : null),
      ...(body.username ? { username: body.username } : null),
      ...(body.password ? { password: body.password } : null),
      ...(body.port ? { port: body.port } : null),
      ...(body.databaseProvider
        ? { databaseProvider: body.databaseProvider }
        : null),
      ...(body.ssl ? { ssl: body.ssl } : null),
      ...(body.name ? { name: body.name } : null),
      ...(body.description ? { description: body.description } : null),
    });
    if (connectionError) throw connectionError;

    return NextResponse.json(
      {
        message: "Connection Updated",
        data: updated,
      } as APIResponse<DatabaseConnectionWithConnectionDetails>,
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an internal error. Your connection was not deleted",
        error:
          "There was an issue establishing a connection. This is a issue with NEO and not with the DB Service Provider.",
      } as APIResponse,
      { status: 500 }
    );
  }
};
