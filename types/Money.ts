import z from "zod";
import { parseFormattedNumber } from "@/lib/utils";

/**
 * Reusable schema for numeric strings that may contain formatting (commas).
 * Validates that the parsed value is a non-negative number.
 */
const formattedNumericStringSchema = (allowEmpty = false) =>
  z.string().refine((val) => {
    if (allowEmpty && (!val || val === "")) return true;
    const num = parseFormattedNumber(val);
    return !isNaN(num) && num >= 0;
  }, "Amount must be a valid non-negative number");

// Form schema without transformations - for use with react-hook-form
export const moneyFormSchema = z.object({
  id: z.string().min(1, "ID is required."),
  name: z
    .string()
    .min(1, "Name it at least 1 character.")
    .max(32, "Name must be at most 32 characters."),
  amount: formattedNumericStringSchema(),
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

// Base schema with transformations - can be extended
export const moneyBasicSchema = moneyFormSchema.extend({
  amount: formattedNumericStringSchema().transform((val) =>
    parseFormattedNumber(val),
  ),
});
export type BasicMoney = z.infer<typeof moneyBasicSchema>;

const moneyIntricateBaseSchema = moneyBasicSchema.extend({
  operation: z.enum(["add", "deduct"]).default("add").optional(),
  amountChange: formattedNumericStringSchema(true).optional(),
  adjustmentType: z.enum(["manual", "addDeduct"]).default("manual").optional(),
  reason: z.string().optional(),
});

// Shared validation logic for intricate money schemas
const intricateSchemaValidation = (
  data: {
    amount: string | number;
    amountChange?: string;
    operation?: "add" | "deduct";
    adjustmentType?: "manual" | "addDeduct";
  },
  ctx: z.RefinementCtx,
) => {
  const amountChangeNum = parseFormattedNumber(data.amountChange);
  const amountNum = parseFormattedNumber(data.amount);

  if (data.adjustmentType === "manual" && amountChangeNum > 0) {
    ctx.addIssue({
      code: "custom",
      message: "Cannot adjust if manually set.",
      path: ["amountChange"],
    });
  }

  if (data.adjustmentType === "addDeduct") {
    if (
      !data.amountChange ||
      data.amountChange === "" ||
      amountChangeNum === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Amount change is required for adjustment.",
        path: ["amountChange"],
      });
    } else {
      const finalAmount =
        data.operation === "add"
          ? amountNum + amountChangeNum
          : amountNum - amountChangeNum;

      if (finalAmount < 0) {
        ctx.addIssue({
          code: "custom",
          message: "Resulting amount cannot be negative.",
          path: ["amountChange"],
        });
      }
    }
  }
};

const moneyIntricateFormBaseSchema = moneyFormSchema.extend({
  operation: z.enum(["add", "deduct"]).default("add").optional(),
  amountChange: formattedNumericStringSchema(true).optional(),
  adjustmentType: z.enum(["manual", "addDeduct"]).default("manual").optional(),
  reason: z.string().optional(),
});

export const moneyIntricateFormSchema =
  moneyIntricateFormBaseSchema.superRefine(intricateSchemaValidation);

export const moneyIntricateSchema = moneyIntricateBaseSchema
  .superRefine(intricateSchemaValidation)
  .transform((data) => {
    // Calculate final amount: amount + addAmount - removeAmount
    if (data.adjustmentType === "addDeduct") {
      const finalAmount =
        data.operation === "add"
          ? parseFormattedNumber(data.amount) +
            parseFormattedNumber(data.amountChange)
          : parseFormattedNumber(data.amount) -
            parseFormattedNumber(data.amountChange);

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

// Form input schema for transfer (before transformation) - for react-hook-form
export const moneyTransferInputSchema = z
  .object({
    senderMoney: moneyIntricateFormBaseSchema
      .extend({
        node: z.enum(["sender", "receiver"]).optional(),
        reason: z.string().optional(),
        demands: formattedNumericStringSchema(),
      })
      .optional(),
    receiverMoneys: z
      .array(
        moneyIntricateFormBaseSchema.extend({
          node: z.enum(["sender", "receiver"]).optional(),
          reason: z.string().optional(),
          demand: formattedNumericStringSchema(true).optional(),
          fee: formattedNumericStringSchema(true).optional(),
        }),
      )
      .min(1, "At least 1 receiver needed."),
  })
  .superRefine((data, ctx) => {
    if (!data.senderMoney) return;

    const totalDemands = data.receiverMoneys.reduce(
      (sum, rm) => sum + parseFormattedNumber(rm.demand),
      0,
    );
    const totalFees = data.receiverMoneys.reduce(
      (sum, rm) => sum + parseFormattedNumber(rm.fee),
      0,
    );
    const senderAmount = parseFormattedNumber(data.senderMoney.amount);

    if (totalDemands + totalFees > senderAmount) {
      ctx.addIssue({
        code: "custom",
        message: `Total demand (${totalDemands + totalFees}) exceeds sender balance (${senderAmount})`,
        path: ["senderMoney", "demands"],
      });
      data.receiverMoneys.forEach((_, i) => {
        ctx.addIssue({
          code: "custom",
          message: `Total demand (${totalDemands + totalFees}) exceeds sender balance (${senderAmount})`,
          path: ["receiverMoneys", i, "demand"],
        });
      });
    }

    if (totalDemands + totalFees === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Total transfer amount must be greater than 0.",
        path: ["senderMoney", "demands"],
      });
    }

    data.receiverMoneys.forEach((rm, i) => {
      if (
        parseFormattedNumber(rm.fee) > 0 &&
        parseFormattedNumber(rm.demand) === 0
      ) {
        ctx.addIssue({
          code: "custom",
          message: `There must be a demand if there is a fee.`,
          path: ["receiverMoneys", i, "fee"],
        });
      }
    });
  });

// Schema with transformations - for final validation/transformation
export const moneyTransferFormSchema = moneyTransferInputSchema.transform(
  (data) => {
    if (!data.senderMoney) {
      throw new Error("Sender money is required");
    }

    return {
      senderMoney: {
        ...data.senderMoney,
        amount: parseFormattedNumber(data.senderMoney.amount),
      },
      receiverMoneys: data.receiverMoneys.map((rm) => ({
        ...rm,
        amount: parseFormattedNumber(rm.amount),
      })),
    };
  },
);

export type MoneyTransfer = z.infer<typeof moneyTransferFormSchema>;
