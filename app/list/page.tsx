"use client";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import _ from "lodash";
import { History, Plane, PlusIcon, Settings } from "lucide-react";
import BottomDrawer from "@/components/bottom-drawer";
import { useMoneysStore } from "@/store/MoneysStore";
import MoneyCard from "@/components/money-card";
import { useActionConfirmStore } from "@/store/ActionConfirm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { amountFormat } from "@/lib/utils";
export default function ListPage() {
  const { moneys } = useMoneysStore();
  const sortedMoneys = moneys.sort((a, b) => a.amount - b.amount);
  const totalMoney = _.sum(moneys.map((money) => Number(money.amount)));
  const { setOpenDialog, setMoneyInAction, setTypeOfAction } =
    useActionConfirmStore();
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
          <BottomDrawer
            title="Settings"
            desc="Set things below."
            trigger={
              <Button variant="secondary" size="icon">
                <Settings />
              </Button>
            }
            content={null}
          />
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
              setMoneyInAction(money);
              setTypeOfAction("removeMoney");
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
