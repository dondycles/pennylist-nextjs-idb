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
import { useMoneysStore } from "@/store/MoneysStore";
import MoneyCard from "./money-card";
import { Button } from "./ui/button";
import { ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
export default function ActionAlertDialog() {
  const router = useRouter();
  const { remove, edit } = useMoneysStore();
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

  const reset = () => {
    setMoneyInAction(undefined);
    setMoneyInActionNewData(undefined);
    setTypeOfAction(undefined);
    setOpenDialog(false);
  };

  if (!moneyInAction) return null;
  return (
    <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          {moneyInAction ? (
            <MoneyCard withOptions={false} money={moneyInAction} />
          ) : null}
          {moneyInActionNewData ? (
            <>
              <ArrowDown className="mx-auto text-muted-foreground size-5" />
              <MoneyCard withOptions={false} money={moneyInActionNewData} />
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
                  reset();
                }
                if (typeOfAction === "editMoney") {
                  if (!moneyInActionNewData) return reset();
                  edit(moneyInActionNewData);
                  reset();
                  router.push("/list");
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
