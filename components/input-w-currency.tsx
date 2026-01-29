import { cn } from "@/lib/utils";
import CurrencySign from "./currency-sign";
import { Input } from "./ui/input";

export default function InpuntWithCurrency({ amountForSign, className, placeholder, ...props }: React.ComponentProps<"input"> & { amountForSign?: number }) {
    return <div className="flex items-center gap-2 relative">
        <CurrencySign amountForSign={amountForSign} className="text-muted-foreground shrink-0 absolute left-3 top-1/2 -translate-y-1/2 font-black text-base" />
        <Input
            {...props}
            type="number"
            placeholder={placeholder || "00.00"}
            className={cn(`pl-${amountForSign ? 14 : 12}`, className)}
        />
    </div>
}