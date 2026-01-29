import { amountFormat, cn } from "@/lib/utils";
import { useListSettingsStore } from "@/store/ListSettings";
import { cva, VariantProps } from "class-variance-authority";

const monetaryValueVariants = cva("font-black truncate", {
  variants: {
    variant: {
      default:
        "[&>[data-slot='amount']]:text-4xl [&>[data-slot='sign']]:text-base",
      sm: "[&>[data-slot='amount']]:text-base [&>[data-slot='sign']]:text-[10px]",
      allBase:
        "[&>[data-slot='amount']]:text-base [&>[data-slot='sign']]:text-base",
    },
    display: {
      default: "",
      hiddenSign: "[&>[data-slot='sign']]:hidden",
      hiddenAmount: "[&>[data-slot='amount']]:hidden",
    },
  },
});

export default function MonetaryValue({
  amount,
  amountForSign,
  className,
  display = "default",
  variant = "default",
}: VariantProps<typeof monetaryValueVariants> & {
  amount: number;
  amountForSign?: number;
  className?: string;
}) {
  const { hideNumbers, currency } = useListSettingsStore();

  return (
    <span
      data-slot="container"
      className={cn(monetaryValueVariants({ variant, className, display }))}
    >
      <span data-slot="sign">
        {amountForSign ? (
          <>
            {amountForSign > 0 ? "+" : null}
            {amountForSign < 0 ? "-" : null}
          </>
        ) : null}
        {currency}
      </span>
      <span data-slot="amount">
        {hideNumbers
          ? Array.from({ length: amount.toString().length }).map(() => "*")
          : amountFormat(amount)}
      </span>
    </span>
  );
}
