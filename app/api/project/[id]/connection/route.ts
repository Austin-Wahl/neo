import { APIResponse } from "@/app/types/types";
import { getProject } from "@/data-access/project";
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

export const POST = async (
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

    // Get the body and validate it
    const body: z.infer<typeof createDatabaseConnectionSchema> =
      await request.json();
    const validation = createDatabaseConnectionSchema.safeParse(body);

    // Find the project
    const [projectError, project] = await getProject(id);
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

    return NextResponse.json(
      {
        message: "Connection Created",
        data: [],
      } as APIResponse,
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
