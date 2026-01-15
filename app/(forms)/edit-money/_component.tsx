"use client";

import Loader from "@/components/loader";
import MoneyForm from "@/components/money-form";
import { useMoneysStore } from "@/store/Moneys";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function EditMoneyComponent({
  targetMoneyId,
}: {
  targetMoneyId: string | undefined;
}) {
  const { moneys, _hasHydrated } = useMoneysStore();
  const targetMoney = moneys.find((money) => money.id === targetMoneyId);

  if (!targetMoneyId) redirect("/add-money");

  if (!_hasHydrated) {
    return <Loader />;
  }

  if (!targetMoney)
    return (
      <main className="flex flex-col items-center justify-center m-auto  text-destructive p-4 text-center space-y-4">
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

  return <MoneyForm action="edit" money={targetMoney} />;
}
