import { APIResponse } from "@/app/types/types";
import { createProject } from "@/data-access/project";
import { Project } from "@/prisma/generated/prisma";
import getServerSideSession from "@/utils/getServerSideSession";
import { createProjectSchema } from "@/validation-schemas/project";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { toPng } from "jdenticon";
import { utapi } from "@/lib/uploadthing";
import { v4 } from "uuid";
// Create project handler
export const POST = async (request: NextRequest) => {
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

    // Get the body and validate it
    const body: z.infer<typeof createProjectSchema> = await request.json();
    const validation = createProjectSchema.safeParse(body);

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

    // Generate a random placeholder image
    const randId = v4();
    const imageBuffer = toPng(randId, 200);
    const arrayBuffer = imageBuffer.buffer.slice(
      imageBuffer.byteOffset,
      imageBuffer.byteOffset + imageBuffer.byteLength
    );

    // File name = <userid>.<projectid>.png
    const file = new File(
      [arrayBuffer as ArrayBuffer],
      session.user.id + "." + randId + ".png",
      { type: "image/png" }
    );
    const { data } = await utapi.uploadFiles(file);

    // Create the project
    const [mutationError, project] = await createProject({
      id: randId,
      name: body.name,
      description: body.description || null,
      ownerId: session.user.id,
      icon: data!.ufsUrl,
    });

    if (mutationError) {
      throw mutationError;
    }

    return NextResponse.json(
      {
        message: "Project created!",
        data: project,
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
