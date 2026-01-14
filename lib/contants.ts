import bdo from "@/imgs/fintechs/bdo.webp";
import bpi from "@/imgs/fintechs/bpi.webp";
import gcash from "@/imgs/fintechs/gcash.webp";
import maya from "@/imgs/fintechs/maya.webp";
import ownbank from "@/imgs/fintechs/ownbank.webp";
import paypal from "@/imgs/fintechs/paypal.webp";
import maribank from "@/imgs/fintechs/maribank.webp";
import cimb from "@/imgs/fintechs/cimb.webp";
import uno from "@/imgs/fintechs/uno.webp";

export const FINTECHS = [
  { label: "GCash", value: "gc", bg: gcash },
  { label: "Maya", value: "my", bg: maya },
  { label: "OwnBank", value: "ob", bg: ownbank },
  { label: "PayPal", value: "pp", bg: paypal },
  { label: "MariBank", value: "mb", bg: maribank },
  { label: "BDO", value: "bdo", bg: bdo },
  { label: "BPI", value: "bpi", bg: bpi },
  { label: "CIMB Bank", value: "cimb", bg: cimb },
  { label: "UNO Digital Bank", value: "uno", bg: uno },
] as const;

export type ListOrderByOptions = "amount" | "name" | "date";

export type ListOrderOptions = {
  by: ListOrderByOptions;
  flow: {
    value: string;
    label: string;
  }[];
};

export const LIST_ORDER_OPTIONS: readonly ListOrderOptions[] = [
  {
    by: "amount",
    flow: [
      { value: "first-to-last", label: "Low to high" },
      { value: "last-to-first", label: "High to low" },
    ],
  },
  {
    by: "name",
    flow: [
      { value: "first-to-last", label: "A-Z" },
      { value: "last-to-first", label: "Z-A" },
    ],
  },
  {
    by: "date",
    flow: [
      { value: "first-to-last", label: "First to last" },
      { value: "last-to-first", label: "Last to first" },
    ],
  },
] as const;
