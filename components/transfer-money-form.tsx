"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Command as CommandPrimitive } from "cmdk";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import * as z from "zod";
import { Plus, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import {
  BasicMoney,
  MoneyTransfer,
  moneyTransferFormSchema,
} from "@/types/Money";
import { useMoneysStore } from "@/store/Moneys";
import { FINTECHS } from "@/lib/contants";
import MoneyTransferCardWForm from "@/components/money-transfer-card-w-form";
import BottomDrawer from "./bottom-drawer";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { memo, useCallback, useEffect, forwardRef, useState } from "react";
import _ from "lodash";
import { toast } from "sonner";
import { useActionConfirmStore } from "@/store/ActionConfirm";
import InpuntWithCurrency from "./input-w-currency";
import MonetaryValue from "./monetary-value";
import Checker from "./checker";

// Move constant outside component to prevent recreation
const COMMAND_ITEM_CLASSNAME = "border rounded-4xl p-0 overflow-hidden";

// Type for form control
type TransferFormControl = ReturnType<
  typeof useForm<z.infer<typeof moneyTransferFormSchema>>
>["control"];

// Memoized Cell component
const Cell = memo(function Cell({
  m,
  checked,
}: {
  m: MoneyTransfer["receiverMoneys"][number];
  checked: boolean;
}) {
  return (
    <div className="w-full h-full p-4 z-0 relative overflow-hidden flex flex-col">
      <p className="z-2 break-all line-clamp-2 text-muted-foreground text-base font-black">
        <span>{m.name}</span>
        {m.tags?.map((tag, i) => (
          <span
            className="text-foreground/25"
            key={`${m.name}-#${tag.tag}-${i}`}
          >
            {" "}
            #{tag.tag.toLowerCase()}
          </span>
        ))}
      </p>
      <MonetaryValue amount={m.amount ?? 0} />
      <Checker checked={checked} />
      <div className="absolute top-0 left-1/2 w-full h-full z-0  opacity-10 pointer-events-none">
        {m.fintech ? (
          <Image
            src={FINTECHS.find((f) => f.value === m.fintech)!.bg}
            alt={m.fintech}
            className="w-auto h-[125%] object-cover object-left"
          />
        ) : null}
      </div>
    </div>
  );
});

// Memoized CellsWrapper component
const CellsWrapper = memo(function CellsWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1  xs:grid-cols-2 gap-2 max-w-lg mx-auto">
      {children}
    </div>
  );
});

// Memoized ModifiedCommand component
const ModifiedCommand = memo(function ModifiedCommand({
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <Command
      className="bg-transparent rounded-4xl **:data-[slot='command-input-wrapper']:max-w-lg **:data-[slot='command-input-wrapper']:w-full **:data-[slot='command-input-wrapper']:mx-auto"
      {...props}
    >
      {children}
    </Command>
  );
});

// Isolated component for form actions that subscribes to isValid
const FormActions = memo(function FormActions({
  control,
  onReset,
}: {
  control: TransferFormControl;
  onReset: () => void;
}) {
  const { isValid } = useFormState({ control });

  return (
    <div className="bg-background/50 backdrop-blur-2xl border-t w-full fixed bottom-0 left-1/2 -translate-x-1/2 ">
      <Field
        orientation="horizontal"
        className="gap-2 max-w-lg w-full mx-auto justify-end p-4 "
      >
        <Button
          disabled={!isValid}
          type="button"
          variant="secondary"
          onClick={onReset}
        >
          Reset
        </Button>
        <Button disabled={!isValid} type="submit" form="transfer-money-form">
          Transfer
        </Button>
      </Field>
    </div>
  );
});

// Isolated component for sender money remaining value display
const SenderMoneyValue = memo(function SenderMoneyValue({
  control,
}: {
  control: TransferFormControl;
}) {
  const amount = useWatch({ control, name: "senderMoney.amount" });
  const demands = useWatch({ control, name: "senderMoney.demands" });

  const remaining = Number(amount ?? 0) - Number(demands ?? 0);
  const amountForSign = Number(amount ?? 0) < Number(demands ?? 0) ? -1 : 0;

  return <MonetaryValue amount={remaining} amountForSign={amountForSign} />;
});

// Isolated component for receiver money value display
const ReceiverMoneyValue = memo(function ReceiverMoneyValue({
  control,
  index,
}: {
  control: TransferFormControl;
  index: number;
}) {
  const amount = useWatch({ control, name: `receiverMoneys.${index}.amount` });
  const demand = useWatch({ control, name: `receiverMoneys.${index}.demand` });

  const total = Number(amount ?? 0) + Number(demand ?? 0);

  return <MonetaryValue amount={total} amountForSign={0} />;
});

// Isolated component that calculates total demands without causing parent re-renders
const DemandsCalculator = memo(function DemandsCalculator({
  control,
  moneys,
  form,
}: {
  control: TransferFormControl;
  moneys: BasicMoney[];
  form: ReturnType<typeof useForm<z.infer<typeof moneyTransferFormSchema>>>;
}) {
  const receivers = useWatch({ control, name: "receiverMoneys" });
  const receiverDemands = useWatch({ control, name: "senderMoney.demands" });

  useEffect(() => {
    const totalDemands = _.sumBy(receivers, (rm) => Number(rm.demand || 0));
    const totalFees = _.sumBy(receivers, (rm) => Number(rm.fee || 0));
    const totalAmount = totalDemands + totalFees;

    form.setValue("senderMoney.demands", totalAmount);
  }, [form, receivers]);

  useEffect(() => {
    const senderMoney = moneys.find(
      (m) => m.id === form.getValues("senderMoney")?.id,
    );
    if (receiverDemands > (senderMoney?.amount ?? 0)) {
      form.setError("senderMoney.demands", {
        message: `Total demand (${receiverDemands}) exceeds sender balance (${senderMoney?.amount})`,
      });
    } else {
      form?.clearErrors("senderMoney.demands");
    }
  }, [form, moneys, receiverDemands]);

  return null; // This component only handles side effects
});

// Memoized Receiver Card to prevent re-renders of other cards when typing
const ReceiverCard = memo(function ReceiverCard({
  money,
  index,
  control,
  onRemove,
}: {
  money: MoneyTransfer["receiverMoneys"][number];
  index: number;
  control: TransferFormControl;
  onRemove: () => void;
}) {
  return (
    <MoneyTransferCardWForm money={money}>
      <>
        <div className="flex justify-between">
          <div className="grid">
            <span className="font-black text-muted-foreground truncate">
              <span>{money.name}</span>
              {money.tags?.map((tag, i) => (
                <span
                  className="text-foreground/25"
                  key={`${money.name}-#${tag.tag}-${i}`}
                >
                  #{tag.tag.toLowerCase()}{" "}
                </span>
              ))}
            </span>
            <ReceiverMoneyValue control={control} index={index} />
          </div>
          <Button
            size={"icon"}
            className="size-fit p-2 z-2 text-muted-foreground"
            variant={"ghost"}
            onClick={onRemove}
          >
            <X />
          </Button>
        </div>
        <Separator className="my-4" />
        <FieldGroup>
          <Controller
            name={`receiverMoneys.${index}.demand`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Amount to receive</FieldLabel>
                <InpuntWithCurrency
                  aria-invalid={fieldState.invalid}
                  amountForSign={1}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name={`receiverMoneys.${index}.fee`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Fee</FieldLabel>
                <InpuntWithCurrency
                  aria-invalid={fieldState.invalid}
                  amountForSign={0}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name={`receiverMoneys.${index}.reason`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Reason (Optional)</FieldLabel>
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id={field.name}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </>
    </MoneyTransferCardWForm>
  );
});

// Isolated component for the receiver select button that watches senderMoney
const ReceiverSelectButton = memo(
  forwardRef<
    HTMLButtonElement,
    {
      control: TransferFormControl;
      fieldName: string;
      hasReceivers: boolean;
    } & React.ComponentPropsWithoutRef<typeof Button>
  >(function ReceiverSelectButton(
    { control, fieldName, hasReceivers, onClick, ...props },
    ref,
  ) {
    const senderMoney = useWatch({ control, name: "senderMoney" });
    const isDisabled = !senderMoney?.id;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isDisabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      },
      [isDisabled, onClick],
    );

    return (
      <Button
        ref={ref}
        id={fieldName}
        variant="secondary"
        role="combobox"
        size="icon"
        className={cn(!hasReceivers && "text-muted-foreground")}
        onClick={handleClick}
        {...props}
        disabled={isDisabled}
      >
        <Plus />
      </Button>
    );
  }),
);

export default function TransferMoneyForm() {
  // Use selective zustand selectors
  const moneys = useMoneysStore((state) => state.moneys);
  const setOpenDialog = useActionConfirmStore((state) => state.setOpenDialog);
  const setMoneysInActionForTransfer = useActionConfirmStore(
    (state) => state.setMoneysInActionForTransfer,
  );
  const setTypeOfAction = useActionConfirmStore(
    (state) => state.setTypeOfAction,
  );

  const form = useForm<z.infer<typeof moneyTransferFormSchema>>({
    resolver: zodResolver(moneyTransferFormSchema),
    defaultValues: {
      senderMoney: undefined,
      receiverMoneys: [],
    },
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const { fields: moneyReceivers, remove: removeMoneyReceiver } = useFieldArray(
    {
      control: form.control,
      name: "receiverMoneys",
    },
  );

  // Memoize handlers
  const handleReset = useCallback(() => {
    form.reset();
    form.setValue("receiverMoneys", undefined as unknown as []);
  }, [form]);

  const handleRemoveReceiver = useCallback(
    (index: number) => {
      removeMoneyReceiver(index);
    },
    [removeMoneyReceiver],
  );

  // Factory for creating stable remove callbacks per index
  const createRemoveHandler = useCallback(
    (index: number) => () => handleRemoveReceiver(index),
    [handleRemoveReceiver],
  );

  const onSubmit = useCallback(
    (transferData: z.infer<typeof moneyTransferFormSchema>) => {
      const fees = transferData.receiverMoneys.reduce(
        (acc, rm) => acc + Number(rm.fee ?? 0),
        0,
      );
      const demands = transferData.receiverMoneys.reduce(
        (acc, rm) => acc + Number(rm.demand ?? 0),
        0,
      );
      const totalAmount = demands + fees;

      console.log(totalAmount, transferData.senderMoney.demands);

      if (totalAmount !== transferData.senderMoney.demands) {
        form.setError("senderMoney.demands", {
          message: "Demands do not match",
        });
        toast.error("Demands do not match");
        return;
      }
      setMoneysInActionForTransfer(transferData);
      setTypeOfAction("transferMoney");
      setOpenDialog(true);
    },
    [form, setMoneysInActionForTransfer, setTypeOfAction, setOpenDialog],
  );

  // Create sender select handler factory
  const createSenderSelectHandler = useCallback(
    (m: (typeof moneys)[number]) => () => {
      form.setValue("senderMoney", {
        ...m,
        node: "sender",
        demands: undefined as unknown as number,
      });
      form.setValue("receiverMoneys", []);
    },
    [form],
  );

  // Create receiver select handler factory
  const createReceiverSelectHandler = useCallback(
    (
      m: (typeof moneys)[number],
      currentReceivers: MoneyTransfer["receiverMoneys"] | undefined,
    ) =>
      () => {
        if (currentReceivers?.find((rm) => rm.id === m.id)) {
          form.setValue("receiverMoneys", [
            ...currentReceivers.filter((rm) => rm.id !== m.id),
          ]);
        } else {
          form.setValue(
            "receiverMoneys",
            currentReceivers
              ? [
                  ...currentReceivers,
                  {
                    ...m,
                    node: "receiver",
                    demand: undefined as unknown as number,
                    reason: "",
                    fee: undefined as unknown as number,
                  },
                ]
              : [
                  {
                    ...m,
                    node: "receiver",
                    demand: undefined as unknown as number,
                    reason: "",
                    fee: undefined as unknown as number,
                  },
                ],
          );
        }
      },
    [form],
  );

  const senderMoneyId = useWatch({
    control: form.control,
    name: "senderMoney.id",
  });

  // Controlled state for receiver drawer - only opens when sender is selected
  const [senderDrawerOpen, setSenderDrawerOpen] = useState(false);
  const handleSenderDrawerOpenChange = useCallback(
    (open: boolean) => {
      setSenderDrawerOpen(open);
    },
    [senderMoneyId],
  );

  return (
    <form
      id="transfer-money-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full px-4 pb-24 flex flex-col items-center overflow-auto"
    >
      {/* Isolated component for demands calculation - doesn't cause parent re-renders */}
      <DemandsCalculator control={form.control} moneys={moneys} form={form} />
      <FieldGroup className="h-full max-w-lg">
        <Controller
          name="senderMoney"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet className="gap-3">
              <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Sender Money</FieldLabel>
                  <FieldDescription>
                    Please select a sender money.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
                <BottomDrawer
                  open={senderDrawerOpen}
                  onOpenChange={handleSenderDrawerOpenChange}
                  trigger={
                    <Button
                      id={field.name}
                      variant="secondary"
                      role="combobox"
                      size="icon"
                      className={cn(
                        !field.value?.id && "text-muted-foreground",
                      )}
                    >
                      <Plus />
                    </Button>
                  }
                  title="Select Sender Money"
                  desc="This is the money that will be sent to the receiver(s)."
                  content={() => (
                    <ModifiedCommand>
                      <div className="px-4">
                        <CommandInput placeholder="Search money..." />
                      </div>
                      <CommandList className="p-4 max-h-full">
                        <CommandEmpty>No money found.</CommandEmpty>
                        <CommandGroup className="max-h-full ">
                          <CellsWrapper>
                            {moneys.map((m, i) => (
                              <CommandItem
                                value={`${m.name}-${i}`}
                                key={m.id}
                                onSelect={() => {
                                  createSenderSelectHandler(m)();
                                  setTimeout(() => {
                                    handleSenderDrawerOpenChange(false);
                                  }, 150);
                                }}
                                className={COMMAND_ITEM_CLASSNAME}
                              >
                                <Cell
                                  m={{
                                    ...m,
                                    node: "sender",
                                    demand: undefined as unknown as number,
                                    reason: "",
                                    fee: undefined as unknown as number,
                                  }}
                                  checked={field.value?.id === m.id}
                                />
                              </CommandItem>
                            ))}
                          </CellsWrapper>
                        </CommandGroup>
                      </CommandList>
                    </ModifiedCommand>
                  )}
                />
              </Field>

              {field.value?.id ? (
                <MoneyTransferCardWForm money={field.value}>
                  <div className="grid">
                    <span className="font-black text-muted-foreground truncate">
                      <span>{field.value.name}</span>
                      {field.value.tags?.map((tag, i) => (
                        <span
                          className="text-foreground/25"
                          key={`${field.value.name}-#${tag.tag}-${i}`}
                        >
                          #{tag.tag.toLowerCase()}{" "}
                        </span>
                      ))}
                    </span>
                    <SenderMoneyValue control={form.control} />

                    <Separator className="my-2" />
                    <Controller
                      control={form.control}
                      name="senderMoney.demands"
                      render={({
                        field: controlField,
                        fieldState: controlFieldState,
                      }) => (
                        <Field
                          data-invalid={controlFieldState.invalid}
                          className="cursor-not-allowed"
                        >
                          <FieldLabel htmlFor={controlField.name}>
                            Demands
                          </FieldLabel>
                          <InpuntWithCurrency
                            className="disabled:opacity-100 aria-invalid:placeholder-destructive "
                            disabled
                            aria-invalid={controlFieldState.invalid}
                            amountForSign={-1}
                            placeholder={controlField.value?.toString()}
                          />
                          {controlFieldState.invalid && (
                            <FieldError errors={[controlFieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                </MoneyTransferCardWForm>
              ) : null}
            </FieldSet>
          )}
        />
        <Controller
          name="receiverMoneys"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet className="gap-3">
              <Field
                orientation="horizontal"
                data-invalid={fieldState.isTouched && fieldState.invalid}
              >
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Receiver Moneys</FieldLabel>
                  <FieldDescription>
                    Please select moneys to transfer to.
                  </FieldDescription>
                  {fieldState.isTouched && fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
                <BottomDrawer
                  trigger={
                    <ReceiverSelectButton
                      control={form.control}
                      fieldName={field.name}
                      hasReceivers={field.value.length > 0}
                    />
                  }
                  title="Select Receiver Moneys"
                  desc="This are the moneys that will receive from the sender."
                  content={() => (
                    <ModifiedCommand>
                      <div className="px-4">
                        <CommandInput placeholder="Search money..." />
                      </div>
                      <CommandList className="p-4 max-h-full">
                        <CommandEmpty>No money found.</CommandEmpty>
                        <CommandGroup className="max-h-full ">
                          <CellsWrapper>
                            {moneys
                              .filter((m) => m.id !== senderMoneyId)
                              .map((m, i) => (
                                <CommandItem
                                  value={`${m.name}-${i}`}
                                  key={m.id}
                                  onSelect={createReceiverSelectHandler(
                                    m,
                                    field.value,
                                  )}
                                  className={COMMAND_ITEM_CLASSNAME}
                                >
                                  <Cell
                                    m={{
                                      ...m,
                                      node: "receiver",
                                      demand: undefined as unknown as number,
                                      reason: "",
                                      fee: undefined as unknown as number,
                                    }}
                                    checked={field.value?.some(
                                      (rm) => rm.id === m.id,
                                    )}
                                  />
                                </CommandItem>
                              ))}
                          </CellsWrapper>
                        </CommandGroup>
                      </CommandList>
                    </ModifiedCommand>
                  )}
                />
              </Field>

              {moneyReceivers?.map((money, index) => (
                <ReceiverCard
                  key={money.id}
                  money={money}
                  index={index}
                  control={form.control}
                  onRemove={createRemoveHandler(index)}
                />
              ))}
            </FieldSet>
          )}
        />
      </FieldGroup>
      <FormActions control={form.control} onReset={handleReset} />
    </form>
  );
}
