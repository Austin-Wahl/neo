import { APIResponse } from "@/app/(neo)/types/types";
import { deleteProject, getProject } from "@/data-access/project";
import { Project } from "@/prisma/generated/prisma";
import getServerSideSession from "@/utils/getServerSideSession";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";

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
