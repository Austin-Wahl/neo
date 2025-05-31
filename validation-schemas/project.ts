import z from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project names must be at least 1 character" })
    .max(20, { message: "Project names can not exceed 20 characters" }),
  description: z
    .string()
    .max(150, {
      message: "Project descriptions must be 150 or fewer characters",
    })
    .optional(),
  icon: z
    .string()
    .url()
    .startsWith(process.env.NEXT_PUBLIC_UPLOADTHING_URL as string)
    .optional(),
});
