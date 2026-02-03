import z from "zod";

// Base schema without transformations - can be extended
export const moneyBasicSchema = z.object({
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
export type BasicMoney = z.infer<typeof moneyBasicSchema>;

const moneyIntricateBaseSchema = moneyBasicSchema.extend({
  operation: z.enum(["add", "deduct"]).default("add").optional(),
  amountChange: z.coerce
    .number<number>("Amount must only be in numeric.")
    .nonnegative("Amount must not be negative")
    .default(0)
    .optional(),
  adjustmentType: z.enum(["manual", "addDeduct"]).default("manual").optional(),
  reason: z.string().optional(),
});

export const moneyIntricateSchema = moneyIntricateBaseSchema
  .superRefine((data, ctx) => {
    if (
      data.adjustmentType === "manual" &&
      Number(data.amountChange ?? 0) > 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Cannot adjust if manually set.",
        path: ["amountChange"],
      });
    }
    if (
      data.adjustmentType === "addDeduct" &&
      (data.amountChange === undefined || data.amountChange === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Amount change is required for adjustment.",
        path: ["amountChange"],
      });
    }
  })
  .transform((data) => {
    // Calculate final amount: amount + addAmount - removeAmount
    if (data.adjustmentType === "addDeduct") {
      const finalAmount =
        data.operation === "add"
          ? Number(data.amount ?? 0) + Number(data.amountChange ?? 0)
          : Number(data.amount ?? 0) - Number(data.amountChange ?? 0);

      return {
        ...data,
        amount: finalAmount,
      };
    }

    if (data.adjustmentType === "manual") {
      return data;
    }

    return data;
  });

export type IntricateMoney = z.infer<typeof moneyIntricateSchema>;

export const moneyTransferFormSchema = z
  .object({
    senderMoney: moneyIntricateBaseSchema
      .extend({
        node: z.enum(["sender", "receiver"]).optional(),
        reason: z.string().optional(),
        demands: z.coerce
          .number<number>("Amount must only be in numeric.")
          .nonnegative("Amount must not be negative"),
      })
      .transform((data) => {
        // Calculate final amount: amount + addAmount - removeAmount
        const finalAmount =
          data.operation === "add"
            ? Number(data.amount ?? 0) + Number(data.amountChange ?? 0)
            : Number(data.amount ?? 0) - Number(data.amountChange ?? 0);

        return {
          ...data,
          amount: finalAmount,
        };
      }),
    receiverMoneys: z
      .array(
        moneyIntricateBaseSchema
          .extend({
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
          })
          .transform((data) => {
            // Calculate final amount: amount + addAmount - removeAmount
            const finalAmount =
              data.operation === "add"
                ? Number(data.amount ?? 0) + Number(data.amountChange ?? 0)
                : Number(data.amount ?? 0) - Number(data.amountChange ?? 0);

            return {
              ...data,
              amount: finalAmount,
            };
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
