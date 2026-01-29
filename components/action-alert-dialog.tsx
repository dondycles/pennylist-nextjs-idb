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
import { Money, MoneyTransfer } from "@/types/Money";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CurrencySign from "./currency-sign";
import Amount from "./amount";

export default function ActionAlertDialog() {

  const {
    openDialog,
    moneyInActionForEditOrRemove,
    setOpenDialog,
    setMoneyInActionForEditOrRemove,
    setTypeOfAction,
    setMoneyInActionNewDataForEditOrRemove,
    setMoneysInActionForTransfer,
    moneysInActionForTransfer
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
              <MoneyCard withOptions={false} money={moneyInActionNewDataForEditOrRemove} />
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
                  date_added: date,
                  id: nanoid(),
                  money_id: money.id,
                  type: "delete",
                  snapshot: {
                    before: { money, total_money },
                    after: {
                      money: { ...money, amount: 0 },
                      total_money: total_money - Number(money.amount)
                    },
                  },
                  reason,
                });
                reset();
              } else if (isEdit) {
                if (!moneyInActionNewDataForEditOrRemove) return reset();
                edit(moneyInActionNewDataForEditOrRemove);
                addHistory({
                  date_added: date,
                  id: nanoid(),
                  money_id: money.id,
                  type: "edit",
                  snapshot: {
                    before: { money, total_money },
                    after: {
                      money: moneyInActionNewDataForEditOrRemove,
                      total_money: total_money - Number(money.amount) + Number(moneyInActionNewDataForEditOrRemove.amount)
                    },
                  },
                  reason,
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
      <Table >
        <TableHeader>
          <TableRow className="[&>th]:text-muted-foreground">
            <TableHead>Type</TableHead>
            <TableHead>Account</TableHead>
            <TableHead className="text-right">Prev. Balance</TableHead>
            <TableHead className="text-right">Transfer</TableHead>
            <TableHead className="text-right">New Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Sender Row */}
          <TableRow className="bg-destructive/10 font-medium">
            <TableCell className="text-destructive" >Sender</TableCell>
            <TableCell>{senderMoney.name}</TableCell>
            <TableCell className="text-right font-black text-base">
              <CurrencySign />
              <Amount amount={Number(senderMoney.amount)} />
            </TableCell>
            <TableCell className="text-right text-destructive font-black text-base">
              <CurrencySign amountForSign={-1} />
              <Amount amount={Number(senderMoney.demands)} />
            </TableCell>

            <TableCell className="text-right font-black text-base">
              <CurrencySign />
              <Amount amount={(Number(senderMoney.amount) - Number(senderMoney.demands))} />
            </TableCell>
          </TableRow>

          {/* Receiver Rows */}
          {receiverMoneys.map((receiver) => (
            <TableRow key={receiver.id} className="bg-green-500/10">
              <TableCell className="text-green-600">Receiver</TableCell>
              <TableCell>{receiver.name}</TableCell>
              <TableCell className="text-right font-black text-base">
                <CurrencySign />
                <Amount amount={Number(receiver.amount)} />
              </TableCell>
              <TableCell className="text-right text-green-600 font-black text-base">
                <CurrencySign amountForSign={1} />
                <Amount amount={Number(receiver.demand)} />
              </TableCell>

              <TableCell className="text-right font-black text-base">
                <CurrencySign />
                <Amount amount={(Number(receiver.amount) + Number(receiver.demand))} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="[&>tr]:text-muted-foreground">
          <TableRow>
            <TableCell colSpan={2} >Total Transfer</TableCell>
            <TableCell />
            <TableCell className="text-right font-black text-base text-foreground">
              <CurrencySign amountForSign={0} />
              <Amount amount={receiverMoneys.reduce((sum, r) => sum + Number(r.demand), 0)} />
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
      <AlertDialogFooter className="mt-4">
        <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
        <Button asChild className="flex-1" variant="destructive">
          <AlertDialogAction
            onClick={() => {
              const updatedSender = {
                ...senderMoney,
                amount: Number(senderMoney.amount) - Number(senderMoney.demands),
                date_edited: date,
              };

              receiverMoneys.forEach((receiver) => {
                const updatedReceiver = {
                  ...receiver,
                  amount: Number(receiver.amount) + Number(receiver.demand),
                  date_edited: date,
                };

                edit(updatedReceiver);
                addHistory({
                  date_added: date,
                  id: nanoid(),
                  money_id: receiver.id,
                  type: "transfer",
                  snapshot: {
                    before: { money: receiver, total_money },
                    after: { money: updatedReceiver, total_money }
                  },
                  reason: receiver.reason,
                });
              });

              edit(updatedSender);
              addHistory({
                date_added: date,
                id: nanoid(),
                money_id: senderMoney.id,
                type: "transfer",
                snapshot: {
                  before: { money: senderMoney, total_money },
                  after: { money: updatedSender, total_money }
                },
                reason: senderMoney.reason,
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
