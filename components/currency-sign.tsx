import { cn } from "@/lib/utils";
import { useListSettingsStore } from "@/store/ListSettings";

export default function CurrencySign({
  className,
  amountForSign,
}: {
  className?: string;
  amountForSign?: number;
}) {
  const { currency } = useListSettingsStore();
  return (
    <span className={cn("font-black text-base", className)}>
      {amountForSign ? (
        <>
          {amountForSign > 0 ? "+" : null}
          {amountForSign < 0 ? "-" : null}
        </>
      ) : null}
      {currency}
    </span>
  );
}
