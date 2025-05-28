import z from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project names must be at least 1 character" })
    .max(1, { message: "Project names must be at least 1 character" }),
  description: z
    .string()
    .max(150, {
      message: "Project descriptions must be 150 or fewer characters",
    })
    .nullable(),
  icon: z
    .string()
    .url()
    .startsWith(process.env.NEXT_PUBLIC_UPLOADTHING_URL as string)
    .nullable(),
});
