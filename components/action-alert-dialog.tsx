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
import { Textarea } from "./ui/textarea";
import Loader from "./loader";
import { Field, FieldLabel } from "./ui/field";
export default function ActionAlertDialog() {
  const router = useRouter();
  const { remove, edit, moneys } = useMoneysStore();
  const { addHistory } = useHistoryStore();
  const [reason, setReason] = useState<string | undefined>();

  const {
    openDialog,
    moneyInActionForEditOrRemove,
    moneyInActionNewDataForEditOrRemove,
    typeOfAction,
    setOpenDialog,
    setMoneyInActionForEditOrRemove,
    setTypeOfAction,
    setMoneyInActionNewDataForEditOrRemove,
  } = useActionConfirmStore();

  const total_money = _.sum(moneys.map((money) => Number(money.amount)));
  const date = new Date().toISOString();

  const reset = () => {
    setMoneyInActionForEditOrRemove(undefined);
    setMoneyInActionNewDataForEditOrRemove(undefined);
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
        {moneyInActionForEditOrRemove ? (
          <>
            <div className="flex flex-col gap-2">
              {moneyInActionForEditOrRemove ? (
                <MoneyCard
                  withOptions={false}
                  money={moneyInActionForEditOrRemove}
                />
              ) : null}
              {moneyInActionNewDataForEditOrRemove ? (
                <>
                  <ArrowDown className="mx-auto text-muted-foreground size-5" />
                  <MoneyCard
                    withOptions={false}
                    money={moneyInActionNewDataForEditOrRemove}
                  />
                  <Field className="mt-4">
                    <FieldLabel htmlFor="reason">Reason</FieldLabel>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(v) => setReason(v.target.value)}
                      placeholder="Reason of modification (Optional but helpful soon)"
                    />
                  </Field>
                </>
              ) : null}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
              <Button asChild variant="destructive" className="flex-1">
                <AlertDialogAction
                  onClick={() => {
                    if (typeOfAction === "removeMoney") {
                      remove(moneyInActionForEditOrRemove);
                      addHistory({
                        date_added: date,
                        id: nanoid(),
                        money_id: moneyInActionForEditOrRemove.id,
                        type: "add",
                        snapshot: {
                          before: {
                            money: moneyInActionForEditOrRemove,
                            total_money,
                          },
                          after: {
                            money: {
                              ...moneyInActionForEditOrRemove,
                              amount: 0,
                            },
                            total_money:
                              Number(total_money) -
                              Number(moneyInActionForEditOrRemove.amount),
                          },
                        },
                      });
                      reset();
                    }
                    if (typeOfAction === "editMoney") {
                      if (!moneyInActionNewDataForEditOrRemove) return reset();
                      edit(moneyInActionNewDataForEditOrRemove);
                      addHistory({
                        date_added: date,
                        id: nanoid(),
                        money_id: moneyInActionForEditOrRemove.id,
                        type: "add",
                        snapshot: {
                          before: {
                            money: moneyInActionForEditOrRemove,
                            total_money,
                          },
                          after: {
                            money: moneyInActionNewDataForEditOrRemove,
                            total_money:
                              Number(total_money) -
                              Number(moneyInActionForEditOrRemove.amount) +
                              Number(
                                moneyInActionNewDataForEditOrRemove.amount,
                              ),
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
