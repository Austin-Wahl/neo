import { APIResponse } from "@/app/(neo)/types/types";
import {
  deleteProject,
  getProject,
  updateProject,
} from "@/data-access/project";
import { utapi } from "@/lib/uploadthing";
import { Project } from "@/prisma/generated/prisma";
import getServerSideSession from "@/utils/getServerSideSession";
import { updateProjectSchema } from "@/validation-schemas/project";
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

    return NextResponse.json(
      {
        message: "Project retrieved!",
        data: project,
      } as APIResponse<Project>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Uh oh. We ran into an issue.",
        error:
          "There was an internal server error. NEO failed to process your request.",
      } as APIResponse,
      { status: 500 }
    );
  }
};

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
          message: "Malformed Project ID",
          error: "Project ID is not a valid UUID",
        } as APIResponse,
        { status: 400 }
      );
    }
    // Find the project
    const [projectError, project] = await getProject({
      where: { id: id },
      include: {
        Icon: {
          select: {
            fileKey: true,
          },
        },
      },
    });
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

    // Delete icon from UploadThing
    await utapi.deleteFiles(project.Icon!.fileKey);
    const [mutationError] = await deleteProject(id);

    if (mutationError) {
      throw mutationError;
    }

    return NextResponse.json(
      {
        message: "Project deleted!",
        data: true,
      } as APIResponse<boolean>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Uh oh. Your project was not deleted.",
        error:
          "There was an internal server error. NEO failed to process your request.",
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
    const updateSchema = updateProjectSchema;

    const body: z.infer<typeof updateSchema> = await request.json();
    const validation = updateSchema.safeParse(body);
    // Find the project
    const [projectError, project] = await getProject({
      where: { id: id },
    });

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

    if (body.description === "") {
      delete body.description;
    }
    const [updateError, updated] = await updateProject({
      id: id,
      ...(body.description ? { description: body.description } : {}),
      ...(body.name ? { name: body.name } : {}),
    });

    if (updateError) throw updateError;

    return NextResponse.json(
      {
        message: "Project Updated",
        data: updated,
      } as APIResponse<Project>,
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an internal error. Your connection was not deleted",
        error: "There was an issue updating your project.",
      } as APIResponse,
      { status: 500 }
    );
  }
};
