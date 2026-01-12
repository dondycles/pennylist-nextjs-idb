"use client";

import EditMoneyForm from "@/components/edit-money-form";
import { Button } from "@/components/ui/button";
import { useMoneysStore } from "@/store/MoneysStore";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";

export default function EditMoneyComponent({
  targetMoneyId,
}: {
  targetMoneyId: string | undefined;
}) {
  const { moneys } = useMoneysStore();
  const targetMoney = moneys.find((money) => money.id === targetMoneyId);

  if (!targetMoney)
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center pt-4 pb-32 px-4 mx-auto gap-6 max-w-lg">
        <Info className="size-16" />
        <h1 className="text-foreground text-2xl font-black">
          Money Not Existing
        </h1>
      </main>
    );

  return (
    <main className="flex min-h-screen w-full flex-col items-center pt-4 pb-32 px-4 mx-auto gap-6 max-w-lg">
      <div className="flex flex-wrap gap-4 justify-between w-full border-b p-4">
        <Button size="icon" variant="secondary" asChild>
          <Link href="/list">
            <ChevronLeft />
          </Link>
        </Button>
        <div className="text-right">
          <h1 className="text-foreground text-2xl font-black">Edit Money</h1>
          <p className="text-muted-foreground font-semibold">
            Edit it as you want.
          </p>
        </div>
      </div>
      <EditMoneyForm money={targetMoney} />
    </main>
  );
}
