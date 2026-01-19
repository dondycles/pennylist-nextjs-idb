import bdo from "@/imgs/fintechs/bdo.webp";
import bpi from "@/imgs/fintechs/bpi.webp";
import gcash from "@/imgs/fintechs/gcash.webp";
import maya from "@/imgs/fintechs/maya.webp";
import ownbank from "@/imgs/fintechs/ownbank.webp";
import paypal from "@/imgs/fintechs/paypal.webp";
import maribank from "@/imgs/fintechs/maribank.webp";
import cimb from "@/imgs/fintechs/cimb.webp";
import uno from "@/imgs/fintechs/uno.webp";
import gotyme from "@/imgs/fintechs/gotyme.webp";

export const FINTECHS = [
  { label: "GCash", value: "gc", bg: gcash, color: "var(--transparent)" }, // Bright Blue
  { label: "Maya", value: "my", bg: maya, color: "var(--transparent)" }, // Neon Green
  { label: "OwnBank", value: "ob", bg: ownbank, color: "var(--ownbank)" }, // Deep Blue
  { label: "PayPal", value: "pp", bg: paypal, color: "var(--transparent)" }, // Navy Blue
  { label: "MariBank", value: "mb", bg: maribank, color: "var(--transparent)" }, // Shopee/Mari Orange
  { label: "BDO", value: "bdo", bg: bdo, color: "var(--transparent)" }, // Royal Blue
  { label: "BPI", value: "bpi", bg: bpi, color: "var(--transparent)" }, // Maroon Red
  { label: "CIMB Bank", value: "cimb", bg: cimb, color: "#ff0000" }, // Red
  {
    label: "UNO Digital Bank",
    value: "uno",
    bg: uno,
    color: "var(--uno)",
  }, // Bright Orange
  { label: "GoTyme", value: "gt", bg: gotyme, color: "#00f5fa" }, // Purple
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
