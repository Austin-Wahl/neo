import { prisma } from "@/lib/prisma";
import { Icon, Prisma, Project } from "@/prisma/generated/prisma";
import { DataAccessResponse } from "./data-access";

// DAL Function for creating a project
export const createProject = async (
  opts: Pick<Project, "name" | "description" | "ownerId" | "icon" | "id"> &
    Pick<Icon, "fileKey" | "fileSize" | "mimeType">
): DataAccessResponse<Project> => {
  try {
    const data = await prisma.$transaction(async (prisma) => {
      const project = await prisma.project.create({
        data: {
          name: opts.name,
          description: opts.description,
          ownerId: opts.ownerId,
          icon: opts.icon,
          id: opts.id,
        },
      });

      // Upload Icon to DB
      await prisma.icon.create({
        data: {
          fileKey: opts.fileKey,
          fileSize: opts.fileSize,
          mimeType: opts.mimeType,
          url: opts.icon,
          projectId: project.id,
        },
      });

      return project;
    });

    return [null, data];
  } catch (error) {
    console.log("[DATA ACCESS | createProject]", error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// DAL Function for deleting a project
export const deleteProject = async (
  id: string
): DataAccessResponse<Project> => {
  try {
    const data = await prisma.project.delete({
      where: {
        id: id,
      },
    });

    return [null, data];
  } catch (error) {
    console.log("[DATA ACCESS | deleteProject]", error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// DAL Function for retrieving projects
export const getProjects = async (
  opts: Prisma.ProjectFindManyArgs
): DataAccessResponse<Project[]> => {
  try {
    const data = await prisma.project.findMany({
      where: opts.where,
      ...opts,
    });

    return [null, data];
  } catch (error) {
    console.log("[DATA ACCESS | getProjects]", error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// DAL Function for updating a project
export const updateProject = async (
  opts: Partial<Pick<Project, "name" | "description">> & Pick<Project, "id">
): DataAccessResponse<Project> => {
  try {
    const data = await prisma.project.update({
      where: {
        id: opts.id,
      },
      data: {
        ...(opts.name ? { name: opts.name } : {}),
        ...(opts.description ? { description: opts.description } : {}),
      },
    });

    return [null, data];
  } catch (error) {
    console.log("[DATA ACCESS | updateProject]", error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// DAL Function for updating a project icon
export const updateProjectImage = async (
  opts: Pick<Project, "id" | "icon"> &
    Pick<Icon, "fileKey" | "fileSize" | "mimeType"> & { iconId: string }
): DataAccessResponse<Project> => {
  try {
    const data = await prisma.$transaction(async (prisma) => {
      const updatedProject = await prisma.project.update({
        where: {
          id: opts.id,
        },
        data: {
          icon: opts.icon,
        },
      });

      await prisma.icon.delete({
        where: {
          id: opts.iconId,
        },
      });

      await prisma.icon.create({
        data: {
          fileKey: opts.fileKey,
          fileSize: opts.fileSize,
          mimeType: opts.mimeType,
          url: opts.icon,
          projectId: updatedProject.id,
        },
      });

      return updatedProject;
    });

    return [null, data];
  } catch (error) {
    console.log("[DATA ACCESS | updateProjectImage]", error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// DAL Function for retrieving a specific project

export const getProject = async <
  T extends Prisma.ProjectFindUniqueArgs,
  R extends
    | number
    | boolean
    | object
    | object[]
    | null = Prisma.ProjectGetPayload<T>
>(
  props: T
): DataAccessResponse<R> => {
  try {
    const data = await prisma.project.findUnique(props);

    return [null, data as R]; // Type assertion to satisfy the generic return type
  } catch (error) {
    console.log("[DATA ACCESS | getProject]", error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// DAL Function for counting projects
export const countProjects = async (
  opts: Prisma.ProjectWhereInput
): DataAccessResponse<number> => {
  try {
    const data = await prisma.project.count({
      where: opts,
    });

    return [null, data];
  } catch (error) {
    console.log("[DATA ACCESS | countProjects]", error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
