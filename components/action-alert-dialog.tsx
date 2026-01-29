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
import { Money } from "@/types/Money";
import HistoryTableInfo from "./history-table-info";

export default function ActionAlertDialog() {
  const {
    openDialog,
    moneyInActionForEditOrRemove,
    setOpenDialog,
    setMoneyInActionForEditOrRemove,
    setTypeOfAction,
    setMoneyInActionNewDataForEditOrRemove,
    setMoneysInActionForTransfer,
    moneysInActionForTransfer,
  } = useActionConfirmStore();

  const reset = () => {
    setMoneyInActionForEditOrRemove(undefined);
    setMoneyInActionNewDataForEditOrRemove(undefined);
    setMoneysInActionForTransfer(undefined);
    setTypeOfAction(undefined);
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
          <EditOrRemove {...moneyInActionForEditOrRemove} />
        ) : moneysInActionForTransfer ? (
          <Transfer />
        ) : (
          <Loader />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditOrRemove(money: Money) {
  const router = useRouter();
  const { remove, edit, moneys } = useMoneysStore();
  const { addHistory } = useHistoryStore();
  const [reason, setReason] = useState<string | undefined>();

  const {
    typeOfAction,
    setOpenDialog,
    setMoneyInActionForEditOrRemove,
    setTypeOfAction,
    setMoneyInActionNewDataForEditOrRemove,
    moneyInActionNewDataForEditOrRemove,
    setMoneysInActionForTransfer,
  } = useActionConfirmStore();

  const total_money = _.sum(moneys.map((money) => Number(money.amount)));
  const date = new Date().toISOString();

  const reset = () => {
    setMoneyInActionForEditOrRemove(undefined);
    setMoneyInActionNewDataForEditOrRemove(undefined);
    setMoneysInActionForTransfer(undefined);
    setTypeOfAction(undefined);
    setReason(undefined);
    setOpenDialog(false);
  };

  const isEdit = typeOfAction === "editMoney";
  const isRemove = typeOfAction === "removeMoney";

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {isEdit ? "Before" : "Original Account"}
          </p>
          <MoneyCard withOptions={false} money={money} />
        </div>

        {isEdit && moneyInActionNewDataForEditOrRemove && (
          <>
            <ArrowDown className="mx-auto text-muted-foreground size-5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">After</p>
              <MoneyCard
                withOptions={false}
                money={moneyInActionNewDataForEditOrRemove}
              />
            </div>
          </>
        )}

        <Field className="mt-2">
          <FieldLabel htmlFor="action-reason">Reason</FieldLabel>
          <Textarea
            id="action-reason"
            value={reason}
            onChange={(v) => setReason(v.target.value)}
            placeholder={`Reason for ${isEdit ? "edit" : "removal"} (Optional)`}
          />
        </Field>
      </div>

      <AlertDialogFooter className="mt-4">
        <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
        <Button
          asChild
          variant={isRemove ? "destructive" : "default"}
          className="flex-1"
        >
          <AlertDialogAction
            onClick={() => {
              if (isRemove) {
                remove(money);
                addHistory({
                  id: nanoid(),
                  date_added: date,
                  type: "delete",
                  transfer_history: null,
                  edit_or_remove_history: [
                    {
                      money_id: money.id,
                      snapshot: {
                        before: money,
                        after: { ...money, amount: 0 },
                      },
                      reason,
                    },
                  ],
                  total_money: {
                    before: total_money,
                    after: total_money - Number(money.amount),
                  },
                });
                reset();
              } else if (isEdit) {
                if (!moneyInActionNewDataForEditOrRemove) return reset();
                edit(moneyInActionNewDataForEditOrRemove);
                addHistory({
                  id: nanoid(),
                  date_added: date,
                  transfer_history: null,
                  type: "edit",
                  edit_or_remove_history: [
                    {
                      money_id: money.id,
                      snapshot: {
                        before: money,
                        after: moneyInActionNewDataForEditOrRemove,
                      },
                      reason,
                    },
                  ],
                  total_money: {
                    before: total_money,
                    after:
                      total_money -
                      Number(money.amount) +
                      Number(moneyInActionNewDataForEditOrRemove.amount),
                  },
                });
                reset();
                router.push("/list");
              }
            }}
          >
            Confirm {isEdit ? "Changes" : "Removal"}
          </AlertDialogAction>
        </Button>
      </AlertDialogFooter>
    </>
  );
}

function Transfer() {
  const router = useRouter();
  const { edit, moneys } = useMoneysStore();
  const { addHistory } = useHistoryStore();

  const {
    setOpenDialog,
    setMoneyInActionForEditOrRemove,
    setTypeOfAction,
    setMoneyInActionNewDataForEditOrRemove,
    moneysInActionForTransfer,
    setMoneysInActionForTransfer,
  } = useActionConfirmStore();

  const total_money = _.sum(moneys.map((money) => Number(money.amount)));
  const date = new Date().toISOString();

  const reset = () => {
    setMoneyInActionForEditOrRemove(undefined);
    setMoneyInActionNewDataForEditOrRemove(undefined);
    setMoneysInActionForTransfer(undefined);
    setTypeOfAction(undefined);
    setOpenDialog(false);
  };

  if (!moneysInActionForTransfer) return null;

  const { senderMoney, receiverMoneys } = moneysInActionForTransfer;

  return (
    <>
      <HistoryTableInfo data={moneysInActionForTransfer} />
      <AlertDialogFooter className="mt-4">
        <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
        <Button asChild className="flex-1" variant="destructive">
          <AlertDialogAction
            onClick={() => {
              const updatedSender = {
                ...senderMoney,
                amount:
                  Number(senderMoney.amount) - Number(senderMoney.demands),
                date_edited: date,
              };
              edit(updatedSender);
              receiverMoneys.forEach((receiver) => {
                const updatedReceiver = {
                  ...receiver,
                  amount: Number(receiver.amount) + Number(receiver.demand),
                  date_edited: date,
                };
                edit(updatedReceiver);
              });

              addHistory({
                id: nanoid(),
                date_added: date,
                type: "transfer",
                edit_or_remove_history: [
                  {
                    money_id: senderMoney.id,
                    snapshot: {
                      before: senderMoney,
                      after: updatedSender,
                    },
                  },
                  ...receiverMoneys.map((receiver) => {
                    const updatedReceiver = {
                      ...receiver,
                      amount: Number(receiver.amount) + Number(receiver.demand),
                      date_edited: date,
                    };
                    return {
                      money_id: receiver.id,
                      snapshot: {
                        before: receiver,
                        after: updatedReceiver,
                      },
                      reason: receiver.reason,
                    };
                  }),
                ],
                transfer_history: moneysInActionForTransfer,
                total_money: {
                  before: total_money,
                  after:
                    total_money -
                    Number(
                      receiverMoneys.reduce((sum, r) => sum + Number(r.fee), 0),
                    ),
                },
              });

              reset();
              router.push("/list");
            }}
          >
            Confirm Transfer
          </AlertDialogAction>
        </Button>
      </AlertDialogFooter>
    </>
  );
}
