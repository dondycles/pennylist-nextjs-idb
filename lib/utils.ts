import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const amountFormat = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    trailingZeroDisplay: "stripIfInteger",
    signDisplay: "auto",
  }).format(amount);
};

/**
 * Parse a formatted number string (with commas) to a number
 * @param value - The formatted number string or number
 * @param defaultValue - The default value to return if parsing fails (default: 0)
 * @returns The parsed number
 */
export const parseFormattedNumber = (
  value: string | number | undefined | null,
  defaultValue: number = 0,
): number => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "number") {
    return value;
  }

  const num = Number(String(value).replace(/,/g, ""));
  return isNaN(num) ? defaultValue : num;
};
