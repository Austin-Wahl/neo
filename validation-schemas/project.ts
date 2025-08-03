import z from "zod";

// Two seperate schemas for future proofing
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project names must be at least 1 character" })
    .max(20, { message: "Project names can not exceed 20 characters" })
    .trim(),
  description: z
    .string()
    .max(100, {
      message: "Project descriptions must be 100 or fewer characters",
    })
    .trim()
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project names must be at least 1 character" })
    .max(20, { message: "Project names can not exceed 20 characters" })
    .trim(),
  description: z
    .string()
    .max(100, {
      message: "Project descriptions must be 100 or fewer characters",
    })
    .trim()
    .optional(),
});
