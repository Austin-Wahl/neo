import { APIResponse } from "@/app/(neo)/types/types";
import {
  countConnections,
  DatabaseConnectionWithConnectionDetails,
  getConnections,
} from "@/data-access/database-connection";
import { getProject } from "@/data-access/project";
import {
  DatabaseConnection,
  DatabaseTypes,
  Prisma,
} from "@/prisma/generated/prisma";
import SupportedDatabase from "@/supported-databases";
import calculatePagination from "@/utils/calculate-pagination";
import getServerSideSession from "@/utils/getServerSideSession";
import parseAndValidateQueryParams, {
  defaultQueryParams,
} from "@/utils/validate-parse-query-params";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";
import z from "zod";

interface ProjectConnectionRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export const GET = async (
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
          message: "Malformed Project ID",
          error: "Project ID is not a valid UUID",
        } as APIResponse,
        { status: 400 }
      );
    }

    // Find the project
    const [projectError, project] = await getProject({ where: { id: id } });
    if (projectError) throw projectError;

    if (!project) {
      return NextResponse.json(
        {
          message: "This project does not exist.",
          error: "A project with the provided UUID could not be found.",
        } as APIResponse,
        { status: 404 }
      );
    }

    // Make sure the user has access to the project
    if (project.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          message: "You do not have access to this project.",
          error:
            "You do not have access to view this project. Contact the Project Owner if you believe you should.",
        } as APIResponse,
        { status: 403 }
      );
    }

    // Validate filters
    const url = request.nextUrl.toString();
    const defaultschema = defaultQueryParams<DatabaseConnection>([
      "createdAt",
      "updatedAt",
      "name",
      "databaseType",
      "ownerId",
      "projectId",
    ]);

    const advancedSearchSchema = z.object({
      databaseType: z.preprocess((arg: unknown) => {
        const val = arg as string | undefined;
        // Split by ","
        const databaseTypeArr = val?.split(",");
        // Strip out all invalid database types

        const valid = databaseTypeArr?.filter((type) =>
          Object.keys(SupportedDatabase).includes(type)
        );

        return valid;
      }, z.array(z.string())),
      connectionId: z.preprocess((arg: unknown) => {
        const val = arg as string | undefined;
        // Split the id string up by ","
        const idArr = val?.split(",");
        // Strip out all invalid ids
        const updatedArr = idArr?.filter((id) => validate(id));
        return updatedArr;
      }, z.array(z.string().uuid())),
    });

    const mergedSchema = defaultschema.merge(advancedSearchSchema);
    const validatedParams = parseAndValidateQueryParams<typeof mergedSchema>({
      schema: mergedSchema,
      url: url,
    });

    const connectionsFilter: Prisma.DatabaseConnectionFindManyArgs = {
      where: {
        OR: validatedParams.search
          ? [
              {
                name: {
                  contains: validatedParams.search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: validatedParams.search,
                  mode: "insensitive",
                },
              },
            ]
          : undefined,

        ...(validatedParams.connectionId
          ? { id: { in: validatedParams.connectionId } }
          : {}),
        ...(validatedParams.databaseType
          ? {
              databaseType: {
                in: validatedParams.databaseType as Array<DatabaseTypes>,
              },
            }
          : {}),
        projectId: id,
      },
      orderBy: {
        [validatedParams.orderBy!]: validatedParams.sortDirection!,
      },
      take: validatedParams.limit,
      skip: validatedParams.offset,
    };

    const [connectionsQueryError, results] = await getConnections(
      connectionsFilter
    );

    const [connectionsQueryCountError, count] = await countConnections(
      connectionsFilter.where ? connectionsFilter.where : {}
    );
    console.log(connectionsFilter);
    if (connectionsQueryError) {
      throw connectionsQueryError;
    }
    if (connectionsQueryCountError) {
      throw connectionsQueryCountError;
    }
    return NextResponse.json(
      {
        message: "Connections retrieved",
        items: results,
        pagination: calculatePagination({
          limit: validatedParams.limit,
          offset: validatedParams.offset,
          totalRecords: count as number,
        }),
      } as APIResponse<Array<DatabaseConnectionWithConnectionDetails>>,
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an internal error. Your connection was not created",
        error:
          "There was an issue establishing a connection. This is a issue with NEO and not with the DB Service Provider.",
      } as APIResponse,
      { status: 500 }
    );
  }
};
