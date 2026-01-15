"use client";

import Loader from "@/components/loader";
import MoneyForm from "@/components/money-form";
import { useMoneysStore } from "@/store/Moneys";
import { Info } from "lucide-react";
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
      <main className="flex flex-col items-center justify-center m-auto">
        <Info className="size-16" />
        <h1 className="text-foreground text-2xl font-black">
          Money Not Existing
        </h1>
      </main>
    );

  return <MoneyForm action="edit" money={targetMoney} />;
}
