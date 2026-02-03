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
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
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

import { MoneyTransfer, moneyTransferFormSchema } from "@/types/Money";
import { useMoneysStore } from "@/store/Moneys";
import { FINTECHS } from "@/lib/contants";
import MoneyTransferCardWForm from "@/components/money-transfer-card-w-form";
import BottomDrawer from "./bottom-drawer";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { useEffect } from "react";
import _ from "lodash";
import { toast } from "sonner";
import { useActionConfirmStore } from "@/store/ActionConfirm";
import InpuntWithCurrency from "./input-w-currency";
import MonetaryValue from "./monetary-value";
import Checker from "./checker";

export default function TransferMoneyForm() {
  const { moneys } = useMoneysStore();
  const { setOpenDialog, setMoneysInActionForTransfer, setTypeOfAction } =
    useActionConfirmStore();

  const COMMAND_ITEM_CLASSNAME = "border rounded-4xl p-0 overflow-hidden";

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

  function onSubmit(transferData: z.infer<typeof moneyTransferFormSchema>) {
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
    // toast(<pre>{JSON.stringify(transferData, null, 2)}</pre>)
  }

  const receivers = useWatch({
    control: form.control,
    name: "receiverMoneys",
  });

  const receiverDemands = useWatch({
    control: form.control,
    name: "senderMoney.demands",
  });

  // useEffect(() => {
  //   // 2. Use a simple loop or _.sumBy for readability/speed
  //   const totalDemands = _.sumBy(receiverMoneys, (rm) => Number(rm.amountToReceive || 0));

  //   if (totalDemands > (senderAmount || 0)) {
  //     form.setError("receiverMoneys", {
  //       message: `Total demand (${totalDemands}) exceeds sender balance (${senderAmount})`,
  //       type: "manual", // Changed to manual for custom logic
  //     });
  //   } else {
  //     form.clearErrors("receiverMoneys");
  //   }

  //   // 3. Clean dependencies: React can track these simple variables easily
  // }, [receiverMoneys, senderAmount, form]);

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

  useEffect(() => {
    const totalDemands = _.sumBy(receivers, (rm) => Number(rm.demand || 0));
    const totalFees = _.sumBy(receivers, (rm) => Number(rm.fee || 0));
    const totalAmount = totalDemands + totalFees;

    form.setValue("senderMoney.demands", totalAmount);
  }, [form, receivers]);

  return (
    <form
      id="transfer-money-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full px-4 pb-24 flex flex-col items-center overflow-auto"
    >
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
                  content={
                    <ModifiedCommand>
                      <CommandInput placeholder="Search money..." />
                      <CommandList className="p-4 max-h-full">
                        <CommandEmpty>No money found.</CommandEmpty>
                        <CommandGroup className="max-h-full ">
                          <CellsWrapper>
                            {moneys.map((m, i) => (
                              <CommandItem
                                value={`${m.name}-${i}`}
                                key={m.id}
                                onSelect={() => {
                                  form.setValue("senderMoney", {
                                    ...m,
                                    node: "sender",
                                    demands: undefined as unknown as number,
                                  });
                                  form.setValue("receiverMoneys", []);
                                }}
                                className={COMMAND_ITEM_CLASSNAME}
                                style={{
                                  background: FINTECHS.find(
                                    (f) => f.value === m.fintech,
                                  )?.color,
                                }}
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
                  }
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
                    <MonetaryValue
                      amount={
                        Number(form.getValues("senderMoney.amount") ?? 0) -
                        Number(form.getValues("senderMoney.demands") ?? 0)
                      }
                      amountForSign={
                        Number(form.getValues("senderMoney.amount") ?? 0) <
                        Number(form.getValues("senderMoney.demands") ?? 0)
                          ? -1
                          : 0
                      }
                    />

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
              <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Receiver Moneys</FieldLabel>
                  <FieldDescription>
                    Please select moneys to transfer to.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
                <BottomDrawer
                  trigger={
                    <Button
                      disabled={form.watch("senderMoney") === undefined}
                      id={field.name}
                      variant="secondary"
                      role="combobox"
                      size="icon"
                      className={cn(
                        !field.value.length && "text-muted-foreground",
                      )}
                    >
                      <Plus />
                    </Button>
                  }
                  title="Select Receiver Moneys"
                  desc="This are the moneys that will receive from the sender."
                  content={
                    <ModifiedCommand>
                      <CommandInput placeholder="Search money..." />
                      <CommandList className="p-4 max-h-full">
                        <CommandEmpty>No money found.</CommandEmpty>
                        <CommandGroup className="max-h-full ">
                          <CellsWrapper>
                            {moneys
                              .filter(
                                (m) => m.id !== form.watch("senderMoney")?.id,
                              )
                              .map((m, i) => (
                                <CommandItem
                                  value={`${m.name}-${i}`}
                                  key={m.id}
                                  onSelect={() => {
                                    if (
                                      field.value?.find((rm) => rm.id === m.id)
                                    ) {
                                      form.setValue("receiverMoneys", [
                                        ...field.value.filter(
                                          (rm) => rm.id !== m.id,
                                        ),
                                      ]);
                                    } else {
                                      form.setValue(
                                        "receiverMoneys",
                                        field.value
                                          ? [
                                              ...field.value,
                                              {
                                                ...m,
                                                node: "receiver",
                                                demand:
                                                  undefined as unknown as number,
                                                reason: "",
                                                fee: undefined as unknown as number,
                                              },
                                            ]
                                          : [
                                              {
                                                ...m,
                                                node: "receiver",
                                                demand:
                                                  undefined as unknown as number,
                                                reason: "",
                                                fee: undefined as unknown as number,
                                              },
                                            ],
                                      );
                                    }

                                    // form.setValue("senderMoney", m);
                                    // setOpenSelectFintech(false);
                                  }}
                                  className={COMMAND_ITEM_CLASSNAME}
                                  style={{
                                    background: FINTECHS.find(
                                      (f) => f.value === m.fintech,
                                    )?.color,
                                  }}
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
                  }
                />
              </Field>

              {moneyReceivers?.map((money, index) => (
                <Controller
                  key={money.id}
                  name={`receiverMoneys.${index}`}
                  control={form.control}
                  render={() => (
                    <MoneyTransferCardWForm key={money.id} money={money}>
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
                            <MonetaryValue
                              amount={
                                Number(
                                  form.watch(
                                    `receiverMoneys.${index}.amount`,
                                  ) ?? 0,
                                ) +
                                Number(
                                  form.watch(
                                    `receiverMoneys.${index}.demand`,
                                  ) ?? 0,
                                )
                              }
                              amountForSign={0}
                            />
                          </div>
                          <Button
                            size={"icon"}
                            className="size-fit p-2 z-2 text-muted-foreground"
                            variant={"ghost"}
                            onClick={() => {
                              removeMoneyReceiver(index);
                            }}
                          >
                            <X />
                          </Button>
                        </div>
                        <Separator className="my-4" />
                        <FieldGroup>
                          <Controller
                            name={`receiverMoneys.${index}.demand`}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Amount to receive
                                </FieldLabel>
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
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Fee
                                </FieldLabel>
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
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Reason (Optional)
                                </FieldLabel>
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
                  )}
                />
              ))}
            </FieldSet>
          )}
        />
      </FieldGroup>
      <div className="bg-background/50 backdrop-blur-2xl border-t w-full fixed bottom-0 left-1/2 -translate-x-1/2 ">
        <Field
          orientation="horizontal"
          className="gap-2 max-w-lg w-full mx-auto justify-end p-4 "
        >
          <Button
            disabled={!form.formState.isValid}
            type="button"
            variant="secondary"
            onClick={() => {
              form.reset();
              form.setValue("receiverMoneys", undefined as unknown as []);
              // if (action === "add")
              //   form.setValue("amount", "" as unknown as number);
            }}
          >
            Reset
          </Button>
          <Button
            disabled={!form.formState.isValid}
            type="submit"
            form="transfer-money-form"
          >
            Transfer
          </Button>
        </Field>
      </div>
    </form>
  );
}

function Cell({
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
      <div className="absolute -z-20 top-0 left-0 h-full w-full bg-linear-to-b from-background to-transparent"></div>
      {m.fintech ? (
        <Image
          src={FINTECHS.find((f) => f.value === m.fintech)!.bg}
          className="m-auto -z-10  absolute object-center h-4 w-auto max-w-16 object-contain bottom-4 left-1/2 -translate-x-1/2"
          alt={m.fintech}
        />
      ) : null}
    </div>
  );
}

function CellsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1  mmxs:grid-cols-2 gap-2 max-w-lg mx-auto">
      {children}
    </div>
  );
}

function ModifiedCommand({
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
}
