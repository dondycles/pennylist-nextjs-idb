"use client";

import Loader from "@/components/loader";
import MoneyForm from "@/components/money-form";
import { useMoneysStore } from "@/store/Moneys";
import { redirect } from "next/navigation";
import MoneyDoesNotExist from "./money-does-not-exist";

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

  if (!targetMoney) return <MoneyDoesNotExist />;

  return <MoneyForm action="edit" targetMoney={targetMoney} />;
}
