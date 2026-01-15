import z from "zod";
import { moneyFormSchema } from "./Money";

export const snapshotMoneyAndTotal = z.object({
  money: moneyFormSchema.optional(),
  total_money: z
    .number("Amount must only be in numeric.")
    .nonnegative("Amount must not be negative"),
});

export const historyFormSchema = z.object({
  id: z.nanoid().min(1, "ID is required."),
  money_id: z.nanoid().min(1, "ID is required."),
  date_added: z.string().min(1, "Date added is required."),
  type: z.enum(["add", "edit", "delete", "transfer"]),
  snapshot: z.object({
    before: snapshotMoneyAndTotal,
    after: snapshotMoneyAndTotal,
  }),
  reason: z.string().optional(),
});

export type History = z.infer<typeof historyFormSchema>;
