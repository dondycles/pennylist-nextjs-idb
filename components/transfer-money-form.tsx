"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Command as CommandPrimitive } from "cmdk";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { CheckCircle2, ChevronUp } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { MoneyForTransfer, moneyTransferFormSchema } from "@/types/Money";
import { useMoneysStore } from "@/store/Moneys";
import { FINTECHS } from "@/lib/contants";
import MoneyCard from "@/components/money-card";
import BottomDrawer from "./bottom-drawer";
import Image from "next/image";
import CurrencySign from "./currency-sign";
import Amount from "./amount";

export default function TransferMoneyForm() {
  const date = new Date().toISOString();
  const { moneys } = useMoneysStore();

  const form = useForm<z.infer<typeof moneyTransferFormSchema>>({
    resolver: zodResolver(moneyTransferFormSchema),
    defaultValues: {
      senderMoney: undefined,
      receiverMoneys: undefined,
    },
  });

  const { fields: receiverMoneys } = useFieldArray({
    control: form.control,
    name: "receiverMoneys",
  });

  function onSubmit(transferData: z.infer<typeof moneyTransferFormSchema>) {
    // const sanitizeMoney: Omit<z.infer<typeof moneyTransferFormSchema>, "amount"> & {
    //   amount: string;
    // } = {
    //   ...money,
    //   amount: String(money.amount),
    // };
  }

  return (
    <form
      id="money-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-lg mx-auto w-full px-4 pb-24 flex-1 grid overflow-auto"
    >
      <FieldGroup className="h-full">
        <Controller
          name="senderMoney"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet className="gap-3">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLegend
                    variant="label"
                    className="m-0 font-black text-muted-foreground"
                  >
                    Sender Money
                  </FieldLegend>
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
                      id="transfer-money-form-sender-money-input"
                      variant="secondary"
                      role="combobox"
                      size="icon"
                      className={cn(!field.value && "text-muted-foreground")}
                    >
                      <ChevronUp />
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
                            {moneys.map((m) => (
                              <CommandItem
                                value={m.name}
                                key={m.id}
                                onSelect={() => {
                                  form.setValue("senderMoney", m);
                                  form.setValue(
                                    "receiverMoneys",
                                    undefined as unknown as MoneyForTransfer[],
                                  );
                                }}
                                className="aspect-square border rounded-4xl p-0 overflow-hidden"
                                style={{
                                  background: FINTECHS.find(
                                    (f) => f.value === m.fintech,
                                  )!.color,
                                }}
                              >
                                <Cell
                                  m={m}
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
              {form.getValues("senderMoney") ? (
                <MoneyCard
                  money={form.getValues("senderMoney")}
                  withOptions={false}
                />
              ) : null}
            </FieldSet>
          )}
        />
        <Controller
          name="receiverMoneys"
          control={form.control}
          render={({ field }) => (
            <FieldSet className="gap-3">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLegend
                    variant="label"
                    className="m-0 font-black text-muted-foreground"
                  >
                    Receiver Moneys
                  </FieldLegend>
                  <FieldDescription>
                    Please select moneys to transfer to.
                  </FieldDescription>
                  {form.formState.errors.receiverMoneys?.root && (
                    <FieldError
                      errors={[form.formState.errors.receiverMoneys.root]}
                    />
                  )}
                </FieldContent>
                <BottomDrawer
                  trigger={
                    <Button
                      id="transfer-money-form-receivers-money-input"
                      variant="secondary"
                      role="combobox"
                      size="icon"
                      className={cn(!field.value && "text-muted-foreground")}
                    >
                      <ChevronUp />
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
                              .map((m) => (
                                <CommandItem
                                  value={m.name}
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
                                        field.value ? [...field.value, m] : [m],
                                      );
                                    }

                                    // form.setValue("senderMoney", m);
                                    // setOpenSelectFintech(false);
                                  }}
                                  className="aspect-square border rounded-4xl p-0 overflow-hidden"
                                  style={{
                                    background: FINTECHS.find(
                                      (f) => f.value === m.fintech,
                                    )!.color,
                                  }}
                                >
                                  <Cell
                                    m={m}
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

              {receiverMoneys.map((m) => (
                <MoneyCard key={m.id} money={m} withOptions={false} />
              ))}
              {/*<FieldGroup className="flex flex-row flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Controller
                key={tag.id}
                name={`tags.${index}.tag`}
                control={form.control}
                render={({ field: controllerField, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="max-w-[calc(33.3333%-6px)]"
                  >
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          {...controllerField}
                          id={`money-form-tag-input-${index}`}
                          aria-invalid={fieldState.invalid}
                          placeholder="savings"
                        />
                        {tags.length > 1 && (
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => removeTag(index)}
                              aria-label={`Remove tag ${index + 1}`}
                            >
                              <XIcon />
                            </InputGroupButton>
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            ))}
          </FieldGroup>*/}
            </FieldSet>
          )}
        />
      </FieldGroup>
      <Field
        orientation="horizontal"
        className="gap-2 max-w-lg justify-end fixed bottom-0 left-1/2 -translate-x-1/2 border-t p-4 bg-background/50 backdrop-blur-2xl"
      >
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            form.reset();
            // if (action === "add")
            //   form.setValue("amount", "" as unknown as number);
          }}
        >
          Reset
        </Button>
        <Button type="submit" form="money-form">
          Transfer
        </Button>
      </Field>
    </form>
  );
}

function Cell({ m, checked }: { m: MoneyForTransfer; checked: boolean }) {
  return (
    <div className="w-full h-full p-4 z-0 relative overflow-hidden ">
      <p className="z-2 leading-none break-all line-clamp-2 text-muted-foreground text-base">
        {m.name}
      </p>
      <p className="z-2 font-black text-base truncate">
        <CurrencySign className="text-xs" />
        <Amount amount={m.amount} />
      </p>
      <CheckCircle2
        className={cn(
          "ml-auto z-2 absolute bottom-4 left-1/2 -translate-x-1/2 text-green-500 size-6 drop-shadow-lg bg-background rounded-full",
          checked ? "opacity-100" : "opacity-0",
        )}
      />
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
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
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
