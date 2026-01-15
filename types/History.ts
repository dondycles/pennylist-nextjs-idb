import z from "zod";

export const historyFormSchema = z.object({
  id: z.nanoid().min(1, "ID is required."),
  money_id: z.nanoid().min(1, "ID is required."),
  date_added: z.string(),
  type: z.enum(["add", "edit", "delete", "transfer"]),
});

export type History = z.infer<typeof historyFormSchema>;
