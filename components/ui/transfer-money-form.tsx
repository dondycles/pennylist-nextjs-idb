"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Check, ChevronsUpDown, XIcon } from "lucide-react";
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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Money,
  MoneyForTransfer,
  moneyTransferFormSchema,
} from "@/types/Money";
import { useMoneysStore } from "@/store/Moneys";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { FINTECHS } from "@/lib/contants";
import { useActionConfirmStore } from "@/store/ActionConfirm";
import { useState } from "react";
import { useHistoryStore } from "@/store/History";
import { toast } from "sonner";
import _ from "lodash";
import MoneyCard from "@/components/money-card";
import { Label } from "@/components/ui/label";

export default function TransferMoneyForm({
  senderMoneyData,
  action,
}: {
  senderMoneyData: MoneyForTransfer;
  action: "add" | "edit";
}) {
  const date = new Date().toISOString();
  const router = useRouter();
  const { moneys } = useMoneysStore();
  const { addHistory } = useHistoryStore();
  const { setMoneysInActionForTransfer, moneysInActionForTransfer } =
    useActionConfirmStore();
  const form = useForm<z.infer<typeof moneyTransferFormSchema>>({
    resolver: zodResolver(moneyTransferFormSchema),
    defaultValues: {
      senderMoney: { ...senderMoneyData, date_edited: date },
      receiverMoneys: undefined,
    },
  });

  const [openSelectFintect, setOpenSelectFintech] = useState(false);

  const {
    fields: receiverMoneys,
    append: appendReceiverMoney,
    remove: removeReceiverMoney,
  } = useFieldArray({
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
                <Field className="gap-2 w-fit" orientation="responsive">
                  <Popover
                    onOpenChange={setOpenSelectFintech}
                    open={openSelectFintect}
                    modal
                  >
                    <PopoverTrigger asChild>
                      <Button
                        id="money-form-fintech-input"
                        variant="secondary"
                        role="combobox"
                        className={cn(
                          "py-0 px-3 text-sm font-bold",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? moneys.find((m) => m.id === field.value.id)?.name
                          : "Select Money"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-50 p-0" align="end">
                      <Command className="rounded-4xl">
                        <CommandInput placeholder="Search money..." />
                        <CommandList>
                          <CommandEmpty>No money found.</CommandEmpty>
                          <CommandGroup>
                            {moneys.map((m) => (
                              <CommandItem
                                value={m.name}
                                key={m.id}
                                onSelect={() => {
                                  // form.setValue(
                                  //   "senderMoney",
                                  //   m.id === form.getValues("senderMoney")?.id
                                  //     ? (undefined as unknown as MoneyForTransfer)
                                  //     : m,
                                  // );
                                  //
                                  router.push(
                                    `/transfer-money?senderMoneyId=${m.id}`,
                                  );
                                  setOpenSelectFintech(false);
                                }}
                              >
                                {m.name}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    m.id === field.value?.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </Field>
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

        {/*<Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="money-form-name-input">Name</FieldLabel>
              <Input
                {...field}
                id="money-form-name-input"
                aria-invalid={fieldState.invalid}
                placeholder="BDO Savings"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="money-form-amount-input">Amount</FieldLabel>
              <Input
                {...field}
                id="money-form-amount-input"
                placeholder="00.00"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                type="number"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="fintech"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="money-form-fintech-input">
                  Fintech?
                </FieldLabel>
                <FieldDescription>
                  Optional. But if it is, it would be cool tho.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Popover
                onOpenChange={setOpenSelectFintech}
                open={openSelectFintect}
                modal
              >
                <PopoverTrigger asChild>
                  <Button
                    id="money-form-fintech-input"
                    variant="secondary"
                    role="combobox"
                    className={cn(
                      "py-0 px-3 text-sm font-bold",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value
                      ? FINTECHS.find(
                          (fintech) => fintech.value === field.value,
                        )?.label
                      : "Select fintech"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-50 p-0" align="end">
                  <Command className="rounded-4xl">
                    <CommandInput placeholder="Search fintech..." />
                    <CommandList>
                      <CommandEmpty>No fintech found.</CommandEmpty>
                      <CommandGroup>
                        {FINTECHS.map((fintech) => (
                          <CommandItem
                            value={fintech.label}
                            key={fintech.value}
                            onSelect={() => {
                              form.setValue(
                                "fintech",
                                fintech.value === form.getValues("fintech")
                                  ? ""
                                  : fintech.value,
                              );
                              setOpenSelectFintech(false);
                            }}
                          >
                            {fintech.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                fintech.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>
          )}
        />*/}
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
            <Field className="gap-2 w-fit" orientation="responsive">
              <Button
                type="button"
                variant="secondary"
                // onClick={() => appendReceiverMoney("")}
                className="py-0 px-3 text-sm font-bold text-muted-foreground"
              >
                Select Money
              </Button>
              {/*{form.getValues("tags")?.length ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => form.resetField("tags")}
                  className="py-0 px-3 text-sm font-bold"
                >
                  Reset Receivers
                </Button>
              ) : null}*/}
            </Field>
          </Field>
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
        <Button className="capitalize" type="submit" form="money-form">
          {action}
        </Button>
      </Field>
    </form>
  );
}
