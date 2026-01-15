"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useActionConfirmStore } from "@/store/ActionConfirm";
import { useMoneysStore } from "@/store/Moneys";
import MoneyCard from "./money-card";
import { Button } from "./ui/button";
import { ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import _ from "lodash";
import { useHistoryStore } from "@/store/History";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import Loader from "./loader";
export default function ActionAlertDialog() {
  const router = useRouter();
  const { remove, edit, moneys } = useMoneysStore();
  const { addHistory } = useHistoryStore();
  const [reason, setReason] = useState<string | undefined>();

  const {
    openDialog,
    moneyInAction,
    moneyInActionNewData,
    typeOfAction,
    setOpenDialog,
    setMoneyInAction,
    setTypeOfAction,
    setMoneyInActionNewData,
  } = useActionConfirmStore();

  const total_money = _.sum(moneys.map((money) => Number(money.amount)));
  const date = new Date().toISOString();

  const reset = () => {
    setMoneyInAction(undefined);
    setMoneyInActionNewData(undefined);
    setTypeOfAction(undefined);
    setReason(undefined);
    setOpenDialog(false);
  };

  // if (!moneyInAction) return null;
  return (
    <AlertDialog
      open={openDialog}
      onOpenChange={(state) => {
        if (!state) reset();
        setOpenDialog(state);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {moneyInAction ? (
          <>
            <div className="flex flex-col gap-2">
              {moneyInAction ? (
                <MoneyCard withOptions={false} money={moneyInAction} />
              ) : null}
              {moneyInActionNewData ? (
                <>
                  <ArrowDown className="mx-auto text-muted-foreground size-5" />
                  <MoneyCard withOptions={false} money={moneyInActionNewData} />
                  <Textarea
                    value={reason}
                    onChange={(v) => setReason(v.currentTarget.value)}
                    className="mt-4"
                    placeholder="Reason of modification (Optional but helpful soon)"
                  />
                </>
              ) : null}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button asChild variant="destructive">
                <AlertDialogAction
                  onClick={() => {
                    if (typeOfAction === "removeMoney") {
                      remove(moneyInAction);
                      addHistory({
                        date_added: date,
                        id: nanoid(),
                        money_id: moneyInAction.id,
                        type: "add",
                        snapshot: {
                          before: { money: moneyInAction, total_money },
                          after: {
                            money: { ...moneyInAction, amount: 0 },
                            total_money:
                              Number(total_money) -
                              Number(moneyInAction.amount),
                          },
                        },
                      });
                      reset();
                    }
                    if (typeOfAction === "editMoney") {
                      if (!moneyInActionNewData) return reset();
                      edit(moneyInActionNewData);
                      addHistory({
                        date_added: date,
                        id: nanoid(),
                        money_id: moneyInAction.id,
                        type: "add",
                        snapshot: {
                          before: { money: moneyInAction, total_money },
                          after: {
                            money: moneyInActionNewData,
                            total_money:
                              Number(total_money) -
                              Number(moneyInAction.amount) +
                              Number(moneyInActionNewData.amount),
                          },
                        },
                        reason,
                      });
                      reset();
                      router.push("/list");
                    }
                  }}
                >
                  Confirm
                </AlertDialogAction>
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <Loader />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
