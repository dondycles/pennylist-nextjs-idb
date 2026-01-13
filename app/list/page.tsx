"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import _ from "lodash";
import { History, Plane, PlusIcon, Settings } from "lucide-react";
import { useMoneysStore } from "@/store/Moneys";
import MoneyCard from "@/components/money-card";
import { useActionConfirmStore } from "@/store/ActionConfirm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { amountFormat } from "@/lib/utils";
import SettingsDialog from "@/components/settings-dialog";
import { useListOrderStore } from "@/store/ListOrder";
import { Money } from "@/types/Money";
export default function ListPage() {
  const { moneys } = useMoneysStore();
  const { order } = useListOrderStore();

  const sortFn = (a: Money, b: Money) => {
    if (order.by === "amount" && order.flow[0].value === "first-to-last") {
      return a.amount - b.amount;
    }
    if (order.by === "amount" && order.flow[0].value === "last-to-first") {
      return b.amount - a.amount;
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
  const totalMoney = _.sum(moneys.map((money) => Number(money.amount)));
  const {
    setOpenDialog,
    setMoneyInAction,
    setTypeOfAction,
    setMoneyInActionNewData,
  } = useActionConfirmStore();
  const route = useRouter();
  return (
    <main className="flex min-h-screen w-full flex-col items-center pt-4 pb-32 px-4 mx-auto gap-6 max-w-lg">
      <div className="rounded-4xl flex flex-col gap-6 text-center bg-muted/25 w-full p-6">
        <div className="grid">
          <p className="font-black text-muted-foreground">Total Money</p>
          <p className="font-black text-4xl truncate">
            {amountFormat.format(totalMoney)}
          </p>
        </div>
        <ButtonGroup className="mx-auto">
          <Button variant="secondary" size="icon">
            <History />
          </Button>
          <Button variant="secondary" size="icon">
            <Plane />
          </Button>
          <SettingsDialog>
            <Button variant="secondary" size="icon">
              <Settings />
            </Button>
          </SettingsDialog>
          <Button variant="default" size="icon" asChild>
            <Link href="/add-money">
              <PlusIcon />
            </Link>
          </Button>
        </ButtonGroup>
      </div>
      {sortedMoneys.map((money) => (
        <MoneyCard
          money={money}
          key={money.id}
          doAction={(type) => {
            if (type === "remove") {
              setTypeOfAction("removeMoney");
              setMoneyInAction(money);
              setMoneyInActionNewData(undefined);
              setOpenDialog(true);
            }
            if (type === "edit") {
              route.push(`/edit-money?moneyId=${money.id}`);
            }
          }}
        />
      ))}
    </main>
  );
}
