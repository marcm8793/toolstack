import { z } from "zod";

export const toolSchema = z
  .object({
    id: z.string().min(1, "Tool ID is required"),
    name: z.string().min(1, "Name is required"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    ecosystem: z.string().min(1, "Ecosystem is required"),
    noGithubRepo: z.boolean(),
    github_link: z.string().url("Must be a valid URL").nullable(),
    website_url: z.string().url("Must be a valid URL"),
    logo_url: z.string().url("Must be a valid URL"),
    github_stars: z
      .number()
      .int()
      .nonnegative("GitHub stars must be a non-negative integer")
      .nullable(),
    badges: z.array(z.string()),
  })
  .refine(
    (data) => {
      if (data.noGithubRepo) {
        return data.github_link === null && data.github_stars === null;
      }
      return data.github_link !== null && data.github_stars !== null;
    },
    {
      message:
        "GitHub link and stars are required if 'No GitHub repo' is not checked",
      path: ["github_link", "github_stars"],
    }
  );

export type ToolFormData = z.infer<typeof toolSchema>;
