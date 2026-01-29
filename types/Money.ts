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
      }),
    )
    .optional(),
  date_added: z.string().min(1, "Date added is required"),
  date_edited: z.string(),
});

export type Money = z.infer<typeof moneyFormSchema>;



export const moneyTransferFormSchema = z
  .object({
    senderMoney: moneyFormSchema.extend({
      node: z.enum(["sender", "receiver"]).optional(),
      reason: z.string().optional(),
      demands: z.coerce
        .number<number>("Amount must only be in numeric.")
        .nonnegative("Amount must not be negative"),
    }),
    receiverMoneys: z.array(moneyFormSchema.extend(
      {
        node: z.enum(["sender", "receiver"]).optional(),
        reason: z.string().optional(),
        demand: z.coerce
          .number<number>("Amount must only be in numeric.")
          .nonnegative("Amount must not be negative"),

        fee: z.coerce
          .number<number>("Amount must only be in numeric.")
          .nonnegative("Amount must not be negative").optional(),
      }
    )).min(1, "At least 1 receiver needed."),
  })
  .superRefine((data, ctx,) => {
    const totalDemands = data.receiverMoneys.reduce(
      (sum, rm) => sum + (Number(rm.demand) || 0),
      0
    );


    if (totalDemands > data.senderMoney.amount) {
      ctx.addIssue({
        code: "custom",
        message: `Total demand (${totalDemands}) exceeds sender balance (${data.senderMoney.amount})`,
        // Attaching to the array root is usually best for "total" logic
        path: ["senderMoney", "demands"],
      });
      data.receiverMoneys.forEach((_, i) => {
        ctx.addIssue({
          code: "custom",
          message: `Total demand (${totalDemands}) exceeds sender balance (${data.senderMoney.amount})`,
          // Attaching to the array root is usually best for "total" logic
          path: ["receiverMoneys", i, "demand"],
        });
      })
    }
  });

export type MoneyTransfer = z.infer<typeof moneyTransferFormSchema>;
