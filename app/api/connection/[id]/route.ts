import { APIResponse } from "@/app/(neo)/types/types";
import {
  deleteConnection,
  getConnection,
} from "@/data-access/database-connection";
import NeoConnection from "@/services/connection-service";
import getServerSideSession from "@/utils/getServerSideSession";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";

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

    // Attempt to estabish a connectiwith tthe database
    const neo = new NeoConnection();
    await neo.init({
      databaseProvider: connection.databaseType,
      hostname: connection.connection!.hostname,
      password: connection.connection!.password ?? "",
      port: connection.connection!.port,
      ssl: connection.connection!.ssl,
      username: connection.connection!.username,
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
