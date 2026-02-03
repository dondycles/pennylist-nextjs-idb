import z from "zod";
import { moneyTransferFormSchema, moneyBasicSchema } from "./Money";

const editOrRemoveHistory = z.object({
  money_id: z.nanoid().min(1, "ID is required."),
  snapshot: z.object({
    before: moneyBasicSchema.optional(),
    after: moneyBasicSchema.optional(),
  }),
  reason: z.string().optional(),
});

export const historyFormSchema = z.object({
  id: z.nanoid().min(1, "ID is required."),
  date_added: z.string().min(1, "Date added is required."),
  type: z.enum(["add", "edit", "delete", "transfer"]),
  transfer_history: moneyTransferFormSchema.nullable(),
  edit_or_remove_history: z.array(editOrRemoveHistory).nullable(),
  total_money: z.object({
    before: z
      .number("Amount must only be in numeric.")
      .nonnegative("Amount must not be negative"),
    after: z
      .number("Amount must only be in numeric.")
      .nonnegative("Amount must not be negative"),
  }),
});

export type History = z.infer<typeof historyFormSchema>;
