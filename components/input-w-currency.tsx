import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import MonetaryValue from "./monetary-value";

export default function InpuntWithCurrency({
  amountForSign,
  className,
  placeholder,
  ...props
}: React.ComponentProps<"input"> & { amountForSign?: number }) {
  return (
    <div
      data-slot="input-w-currency-container"
      className="flex items-center gap-2 relative"
    >
      <MonetaryValue
        amount={0}
        amountForSign={amountForSign}
        display={"hiddenAmount"}
        variant="allBase"
        className="absolute left-4 top-1/2 -translate-y-1/2"
      />
      <Input
        {...props}
        placeholder={placeholder || "00.00"}
        className={cn(`${amountForSign ? "pl-15" : "pl-13"}`, className)}
        data-type="number"
        inputMode="numeric"
        type="text"
      />
    </div>
  );
}
