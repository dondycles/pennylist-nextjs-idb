import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export default function Checker({
  checked,
  className,
}: {
  checked: boolean;
  className?: string;
}) {
  return (
    <CheckCircle2
      className={cn(
        "ml-auto z-2 absolute top-2 right-2 text-green-500 size-8 rounded-full fill-background shadow",
        checked ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
