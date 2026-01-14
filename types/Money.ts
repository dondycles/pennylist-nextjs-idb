import z from "zod";

export const moneyFormSchema = z.object({
  id: z.nanoid().min(1, "ID is required."),
  name: z
    .string()
    .min(1, "Name it at least 1 character.")
    .max(32, "Name must be at most 32 characters."),
  amount: z.coerce
    .number<number>("Amount must only be in numeric.")
    .nonnegative("Amount must not be negative"),
  fintech: z.string().optional(),
  tags: z
    .array(
      z.object({
        tag: z.string().min(1, "Tag it with at least 1 character."),
      })
    )
    .optional(),
  date_added: z.string(),
  date_edited: z.string(),
});

export type Money = z.infer<typeof moneyFormSchema>;
