"use client";

import Loader from "@/components/loader";
import { useMoneysStore } from "@/store/Moneys";
import { redirect } from "next/navigation";
import MoneyDoesNotExist from "@/components/money-does-not-exist";
import TransferMoneyForm from "./transfer-money-form";

export default function TransferMoneyComponent({
  senderMoneyId,
}: {
  senderMoneyId: string | undefined;
}) {
  const { moneys, _hasHydrated } = useMoneysStore();
  const senderMoneyData = moneys.find((money) => money.id === senderMoneyId);

  if (!senderMoneyId) redirect("/add-money");

  if (!_hasHydrated) {
    return <Loader />;
  }

  if (!senderMoneyData) return <MoneyDoesNotExist />;

  return (
    <TransferMoneyForm
      action="edit"
      senderMoneyData={{ ...senderMoneyData, node: "sender" }}
    />
  );
}
