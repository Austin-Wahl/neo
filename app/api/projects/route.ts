import { APIResponse } from "@/app/types/types";
import { countProjects, getProjects } from "@/data-access/project";
import { Prisma, Project } from "@/prisma/generated/prisma";
import calculatePagination from "@/utils/calculate-pagination";
import getServerSideSession from "@/utils/getServerSideSession";
import parseAndValidateQueryParams, {
  defaultQueryParams,
} from "@/utils/validate-parse-query-params";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
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

    // Validate filters
    const url = request.nextUrl.toString();
    const defaultschema = defaultQueryParams<Project>([
      "createdAt",
      "updatedAt",
      "name",
    ]);

    const validatedParams = parseAndValidateQueryParams<typeof defaultschema>({
      schema: defaultschema,
      url: url,
    });

    // Get data
    const where: Prisma.ProjectWhereInput = {
      ownerId: session.user.id,
      OR: [
        {
          name: {
            contains: validatedParams.search,
            mode: "insensitive",
          },
          description: {
            contains: validatedParams.search,
            mode: "insensitive",
          },
        },
      ],
    };
    const [queryError, projects] = await getProjects({
      where,
      take: validatedParams.limit,
      skip: validatedParams.offset,
      orderBy: {
        [validatedParams.orderBy as string]: validatedParams.sortDirection,
      },
    });
    if (queryError) throw queryError;

    const [countError, totalProjects] = await countProjects(where);
    if (countError) throw countError;

    return NextResponse.json(
      {
        message: "Projects retrieved.",
        items: projects,
        pagination: calculatePagination({
          limit: validatedParams.limit,
          offset: validatedParams.offset,
          totalRecords: totalProjects as number,
        }),
      } as APIResponse<Project[]>,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Uh oh. Your project was not created.",
        error:
          "There was an internal server error. NEO failed to process your request.",
      } as APIResponse,
      { status: 500 }
    );
  }
};
