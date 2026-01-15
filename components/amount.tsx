import { amountFormat } from "@/lib/utils";
import { useListSettingsStore } from "@/store/ListSettings";

export default function Amount({ amount }: { amount: number }) {
  const { hideNumbers } = useListSettingsStore();
  return (
    <span>
      {hideNumbers
        ? Array.from({ length: amount.toString().length }).map(() => "*")
        : amountFormat(amount)}
    </span>
  );
}
