"use client";
import { Main } from "./_main";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { History, List, Plane, PlusIcon, Settings } from "lucide-react";

import SettingsDialog from "@/components/settings-dialog";
import _ from "lodash";
import { useMoneysStore } from "@/store/Moneys";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Loader from "@/components/loader";
import { usePathname } from "next/navigation";
import { useHistoryStore } from "@/store/History";
import { useListSettingsStore } from "@/store/ListSettings";
import CurrencySign from "@/components/currency-sign";
import Amount from "@/components/amount";

export default function ListsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { moneys, _hasHydrated: _moneysHasHydrated } = useMoneysStore();
  const { _hasHydrated: _historiesHasHydrated } = useHistoryStore();
  const { _hasHydrated: _listOrderHasHydrated } = useListSettingsStore();

  const totalMoney = _.sum(moneys.map((money) => Number(money.amount)));

  if (!_moneysHasHydrated || !_historiesHasHydrated || !_listOrderHasHydrated) {
    return (
      <Main>
        <Skeleton className="rounded-b-4xl bg-muted dark:bg-muted/25 p-6 w-full h-46 flex justify-center">
          <Loader />
        </Skeleton>
      </Main>
    );
  }
  return (
    <Main>
      <div className="rounded-b-4xl flex flex-col gap-6 text-center bg-muted/75 dark:bg-muted/20 w-full p-6">
        <div className="grid">
          <p className="font-black text-muted-foreground">Total Money</p>
          <p className="font-black text-4xl truncate">
            <CurrencySign />
            <Amount amount={totalMoney} />
          </p>
        </div>
        <ButtonGroup className="mx-auto">
          {pathname === "/list" ? (
            <Button variant="secondary" size="icon" asChild>
              <Link href="/history">
                <History />
              </Link>
            </Button>
          ) : null}
          {pathname === "/history" ? (
            <Button variant="secondary" size="icon" asChild>
              <Link href="/list">
                <List />
              </Link>
            </Button>
          ) : null}
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
      {children}
    </Main>
  );
}
