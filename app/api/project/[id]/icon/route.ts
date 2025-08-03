import { APIResponse } from "@/app/(neo)/types/types";
import { getProject, updateProjectImage } from "@/data-access/project";
import { utapi } from "@/lib/uploadthing";
import { Project } from "@/prisma/generated/prisma";
import getServerSideSession from "@/utils/getServerSideSession";
import validateImage from "@/utils/validate-image";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { v4, validate } from "uuid";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export const POST = async (request: NextRequest, { params }: RouteProps) => {
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
    const [projectError, project] = await getProject({
      where: { id: id },
      include: {
        Icon: {
          select: {
            id: true,
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
            "You do not have access to update this project. Contact the Project Owner if you believe you should.",
        } as APIResponse,
        { status: 403 }
      );
    }

    // Get the body and validate it
    const formData = await request.formData();
    const image = formData.get("icon") as File;

    const { message, status } = await validateImage(image as File);
    if (!status) {
      return NextResponse.json(
        {
          error: "Invalid Image",
          message: message,
        } as APIResponse,
        { status: 400 }
      );
    }

    // Generate a random placeholder image
    const randId = v4();
    const imageArrayBuffer = (
      await sharp(await image.arrayBuffer())
        .toFormat("png")
        .toBuffer()
    ).buffer;

    // Construct new file
    const file = new File(
      [imageArrayBuffer as ArrayBuffer],
      session.user.id + "." + randId + ".png",
      { type: "image/png" }
    );

    // Delete previous icon from UploadThing
    await utapi.deleteFiles(project.Icon!.fileKey);
    const { data } = await utapi.uploadFiles(file);

    // Create the project
    const [mutationError, updatedProjectIcon] = await updateProjectImage({
      id: id,
      icon: data!.ufsUrl,
      fileKey: data!.key,
      fileSize: data!.size,
      iconId: project.Icon!.id,
      mimeType: "image/png",
    });

    if (mutationError) {
      throw mutationError;
    }

    return NextResponse.json(
      {
        message: "Project created!",
        data: updatedProjectIcon,
      } as APIResponse<Project>,
      { status: 201 }
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
