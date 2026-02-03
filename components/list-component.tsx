"use client";
import { useMoneysStore } from "@/store/Moneys";
import MoneyCard from "@/components/money-card";
import { useActionConfirmStore } from "@/store/ActionConfirm";
import { useRouter } from "next/navigation";
import { useListSettingsStore } from "@/store/ListSettings";
import { BasicMoney } from "@/types/Money";

export default function ListPageComponent() {
  const { moneys } = useMoneysStore();
  const { order } = useListSettingsStore();

  const sortFn = (a: BasicMoney, b: BasicMoney) => {
    if (order.by === "amount" && order.flow[0].value === "first-to-last") {
      return (a.amount ?? 0) - (b.amount ?? 0);
    }
    if (order.by === "amount" && order.flow[0].value === "last-to-first") {
      return (b.amount ?? 0) - (a.amount ?? 0);
    }

    if (order.by === "date" && order.flow[0].value === "first-to-last")
      return (
        new Date(a.date_added).getTime() - new Date(b.date_added).getTime()
      );
    if (order.by === "date" && order.flow[0].value === "last-to-first")
      return (
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime()
      );

    if (order.by === "name" && order.flow[0].value === "first-to-last")
      return a.name.localeCompare(b.name);
    if (order.by === "name" && order.flow[0].value === "last-to-first")
      return b.name.localeCompare(a.name);

    return new Date(a.date_added).getTime() - new Date(b.date_added).getTime();
  };
  const sortedMoneys = moneys.sort((a, b) => sortFn(a, b));
  const {
    setOpenDialog,
    setMoneyInActionForEditOrRemove,
    setTypeOfAction,
    setMoneyInActionNewDataForEditOrRemove,
  } = useActionConfirmStore();
  const route = useRouter();

  return sortedMoneys.map((money) => (
    <MoneyCard
      money={money}
      key={money.id}
      doAction={(type) => {
        if (type === "remove") {
          setTypeOfAction("removeMoney");
          setMoneyInActionForEditOrRemove(money);
          setMoneyInActionNewDataForEditOrRemove(undefined);
          setOpenDialog(true);
        }
        if (type === "edit") {
          route.push(`/edit-money?moneyId=${money.id}`);
        }
      }}
    />
  ));
}
