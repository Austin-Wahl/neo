import { prisma } from "@/lib/prisma";
import { Prisma, Project } from "@/prisma/generated/prisma";
import { DataAccessResponse } from "./data-access";

// DAL Function for creating a project
export const createProject = async (
  opts: Pick<Project, "name" | "description" | "ownerId" | "icon" | "id">
): DataAccessResponse<Project> => {
  try {
    const data = await prisma.project.create({
      data: opts,
    });

    return [null, data];
  } catch (error) {
    console.log("[DATA ACCESS | createProject]", error);
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

// DAL Function for retrieving a specific project
export const getProject = async (id: string): DataAccessResponse<Project> => {
  try {
    const data = await prisma.project.findUnique({
      where: {
        id: id,
      },
    });

    return [null, data];
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
