import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";

export default function MoneyDoesNotExist() {
  return (
    <main className="flex flex-col items-center justify-center m-auto text-destructive p-4 text-center space-y-4">
      <Info className="size-16" />
      <h1 className="text-2xl font-black">Money does not exist</h1>
      <Link
        href="/list"
        className="text-muted-foreground font-semibold text-base inline-flex gap-1"
      >
        <ChevronLeft /> Back to list
      </Link>
    </main>
  );
}
