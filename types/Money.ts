import z from "zod";

export const moneyFormSchema = z
  .object({
    id: z.nanoid().min(1, "ID is required."),
    name: z
      .string()
      .min(1, "Name it at least 1 character.")
      .max(32, "Name must be at most 32 characters."),
    amount: z.coerce
      .number<number>("Amount must only be in numeric.")
      .nonnegative("Amount must not be negative")
      .default(0)
      .optional(),
    addAmount: z.coerce
      .number<number>("Amount must only be in numeric.")
      .nonnegative("Amount must not be negative")
      .default(0)
      .optional(),
    removeAmount: z.coerce
      .number<number>("Amount must only be in numeric.")
      .nonnegative("Amount must not be negative")
      .default(0)
      .optional(),
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
  })
  .superRefine((data, ctx) => {
    if ((data.removeAmount ?? 0) > (data.amount ?? 0) + (data.addAmount ?? 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Remove amount cannot be greater than current amount.",
        path: ["removeAmount"],
      });
    }
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
    receiverMoneys: z
      .array(
        moneyFormSchema.extend({
          node: z.enum(["sender", "receiver"]).optional(),
          reason: z.string().optional(),
          demand: z.coerce
            .number<number>("Amount must only be in numeric.")
            .nonnegative("Amount must not be negative")
            .default(0)
            .optional(),
          fee: z.coerce
            .number<number>("Amount must only be in numeric.")
            .nonnegative("Amount must not be negative")
            .default(0)
            .optional(),
        }),
      )
      .min(1, "At least 1 receiver needed."),
  })
  .superRefine((data, ctx) => {
    const totalDemands = data.receiverMoneys.reduce(
      (sum, rm) => sum + (Number(rm.demand) || 0),
      0,
    );

    if (totalDemands > (data.senderMoney.amount ?? 0)) {
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
      });
    }

    data.receiverMoneys.forEach((rm, i) => {
      if ((rm.fee ?? 0) > 0 && rm.demand === 0) {
        ctx.addIssue({
          code: "custom",
          message: `There must be a demand if there is a fee.`,
          path: ["receiverMoneys", i, "fee"],
        });
      }
    });
  });

export type MoneyTransfer = z.infer<typeof moneyTransferFormSchema>;
