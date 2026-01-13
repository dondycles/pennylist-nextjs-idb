import bdo from "@/imgs/fintechs/bdo.webp";
import bpi from "@/imgs/fintechs/bpi.webp";
import gcash from "@/imgs/fintechs/gcash.webp";
import maya from "@/imgs/fintechs/maya.webp";

export const FINTECHS = [
  { label: "GCash", value: "gc", bg: gcash },
  { label: "Maya", value: "my", bg: maya },
  { label: "OwnBank", value: "ob", bg: undefined },
  { label: "PayPal", value: "pp", bg: undefined },
  { label: "MariBank", value: "mb", bg: undefined },
  { label: "BDO", value: "bdo", bg: bdo },
  { label: "BPI", value: "bpi", bg: bpi },
  { label: "CIMB Bank", value: "cimb", bg: undefined },
  { label: "UNO Digital Bank", value: "uno", bg: undefined },
] as const;
