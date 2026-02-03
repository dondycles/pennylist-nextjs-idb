"use client";

import Loader from "@/components/loader";
import { useMoneysStore } from "@/store/Moneys";
import { redirect } from "next/navigation";
import MoneyDoesNotExist from "@/components/money-does-not-exist";
import EditMoneyForm from "./edit-money-form";

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

  return <EditMoneyForm targetMoney={targetMoney} />;
}
