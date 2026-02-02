"use client";
import { Button } from "./ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { CheckCircle2, ChevronsUpDown, Minus, Plus, XIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { Money, moneyFormSchema } from "@/types/Money";
import { useMoneysStore } from "@/store/Moneys";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { FINTECHS } from "@/lib/contants";
import { useActionConfirmStore } from "@/store/ActionConfirm";
import { useEffect, useState } from "react";
import { useHistoryStore } from "@/store/History";
import { toast } from "sonner";
import _ from "lodash";
import BottomDrawer from "./bottom-drawer";
import Image from "next/image";
import InpuntWithCurrency from "./input-w-currency";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import MonetaryValue from "./monetary-value";
import { Textarea } from "./ui/textarea";

export default function MoneyForm({
  targetMoney,
  action,
}: {
  targetMoney?: Money;
  action: "add" | "edit";
}) {
  const date = new Date().toISOString();
  const router = useRouter();
  const { add, moneys } = useMoneysStore();
  const { addHistory } = useHistoryStore();
  const {
    setMoneyInActionForEditOrRemove,
    setOpenDialog,
    setTypeOfAction,
    setMoneyInActionNewDataForEditOrRemove,
  } = useActionConfirmStore();
  const form = useForm<z.infer<typeof moneyFormSchema>>({
    resolver: zodResolver(moneyFormSchema),
    defaultValues: targetMoney
      ? {
          ...targetMoney,
          date_edited: date,
          amountChange: "" as unknown as number,
          operation: "add",
        }
      : {
          id: nanoid(),
          name: "",
          amount: "" as unknown as number,
          fintech: "",
          tags: [],
          date_added: date,
          date_edited: date,
          amountChange: "" as unknown as number,
          operation: "add",
        },
  });

  const [openSelectFintect, setOpenSelectFintech] = useState(false);

  const amountChange = useWatch({
    control: form.control,
    name: "amountChange",
  });

  const operation = useWatch({
    control: form.control,
    name: "operation",
  });

  const amount = useWatch({
    control: form.control,
    name: "amount",
  });

  const {
    fields: tags,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  function onSubmit(money: z.infer<typeof moneyFormSchema>) {
    const sanitizeMoney: Omit<z.infer<typeof moneyFormSchema>, "amount"> & {
      amount: string;
    } = {
      ...money,
      amount: String(money.amount),
    };
    if (
      _.isEqual(
        _.omit(sanitizeMoney, "date_edited"),
        _.omit(targetMoney, "date_edited"),
      )
    )
      return toast.error("No Changes", {
        description: "Make changes in order to edit.",
      });

    if (action === "add") addMoney(money);

    if (action === "edit") {
      if (!moneys.find((m) => m.id === money.id))
        return toast.error("Invalid Money", {
          description: "The money does not exist.",
        });
      editMoney(money);
    }
  }

  function addMoney(money: z.infer<typeof moneyFormSchema>) {
    if (action !== "add") return;
    const total_money = _.sum(moneys.map((money) => Number(money.amount)));
    add(money);
    addHistory({
      id: nanoid(),
      date_added: date,
      type: "add",
      transfer_history: null,
      edit_or_remove_history: [
        {
          money_id: money.id,
          snapshot: {
            after: form.getValues(),
          },
        },
      ],
      total_money: {
        before: total_money,
        after:
          Number(total_money) -
          Number(targetMoney ? targetMoney.amount : 0) +
          Number(form.getValues("amount")),
      },
    });
    router.push("/list");
  }

  function editMoney(money: z.infer<typeof moneyFormSchema>) {
    if (action !== "edit") return;
    setMoneyInActionForEditOrRemove(targetMoney);
    setMoneyInActionNewDataForEditOrRemove(money);
    setTypeOfAction("editMoney");
    setOpenDialog(true);
  }

  // useEffect(() => {
  //   form.setValue(
  //     "amount",
  //     Number(targetMoney?.amount ?? 0) +
  //       Number(form.getValues("addAmount")) -
  //       Number(form.getValues("removeAmount")),
  //   );
  // }, [addAmount, form, removeAmount, targetMoney?.amount]);

  useEffect(() => {
    const diff = Number(targetMoney?.amount ?? 0) - amount;
    form.setValue("operation", diff > 0 ? "deduct" : "add");
    form.setValue("amountChange", Math.abs(diff));
  }, [amount, form]);

  return (
    <form
      id="money-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full px-4 pb-24 flex flex-col items-center overflow-auto"
    >
      <FieldGroup className="h-full max-w-lg">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
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
              <FieldLabel htmlFor={field.name}>
                {targetMoney ? "Current " : null}Amount
              </FieldLabel>
              <InpuntWithCurrency
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <FieldGroup
          hidden={!targetMoney}
          className="border border-dashed rounded-3xl p-6"
        >
          <div className="flex flex-col gap-4">
            <Controller
              name="amountChange"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Adjustment</FieldLabel>
                  <InpuntWithCurrency
                    min={0}
                    aria-invalid={fieldState.invalid}
                    amountForSign={operation === "add" ? 1 : -1}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="operation"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">Operation</FieldLegend>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    className="[&>*>*>svg]:size-4 grid-cols-[1fr_1fr] gap-4"
                  >
                    {["add", "deduct"].map((operation) => (
                      <Field
                        key={operation}
                        orientation="horizontal"
                        className="bg-muted rounded-full px-3 py-1 border border-input"
                      >
                        <RadioGroupItem value={operation} id={operation} />
                        <FieldLabel
                          htmlFor={operation}
                          className="capitalize text-base font-bold"
                        >
                          {operation === "add" ? <Plus /> : <Minus />}{" "}
                          {operation}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />
          </div>
          <FieldSeparator className="opacity-50" />
          <Field className="flex flex-row gap-4 [&>*]:w-fit">
            <FieldLabel htmlFor="finalAmount" className="mt-auto flex-1">
              Final Amount:
            </FieldLabel>
            <div id="finalAmount" className="w-fit">
              <MonetaryValue
                amountForSign={
                  operation === "add"
                    ? 0
                    : Number(amount ?? 0) - Number(amountChange ?? 0) >= 0
                      ? 0
                      : -1
                }
                amount={
                  operation === "add"
                    ? Number(amount ?? 0) + Number(amountChange ?? 0)
                    : Number(amount ?? 0) - Number(amountChange ?? 0)
                }
              />
            </div>
          </Field>
        </FieldGroup>
        <Controller
          name="fintech"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Fintech?</FieldLabel>
                <FieldDescription>
                  Optional. But if it is, it would be cool tho.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <BottomDrawer
                onOpenChange={setOpenSelectFintech}
                open={openSelectFintect}
                trigger={
                  <Button
                    id={field.name}
                    variant="secondary"
                    role="combobox"
                    aria-expanded={openSelectFintect}
                    className={cn(
                      "py-0 px-3 text-sm font-bold border border-input",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value
                      ? FINTECHS.find(
                          (fintech) => fintech.value === field.value,
                        )?.label
                      : "Select Fintech"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                }
                title="Select Fintech"
                desc="Optional. But if it is, it would be cool tho."
                content={
                  <Command className="bg-transparent rounded-4xl **:data-[slot='command-input-wrapper']:max-w-lg **:data-[slot='command-input-wrapper']:w-full **:data-[slot='command-input-wrapper']:mx-auto">
                    <CommandInput placeholder="Search fintech..." />
                    <CommandList className="p-4 max-h-full">
                      <CommandEmpty>No fintech found.</CommandEmpty>
                      <CommandGroup>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 max-w-lg mx-auto p-1">
                          {FINTECHS.map((fintech, i) => (
                            <CommandItem
                              aria-checked={
                                fintech.value === form.getValues("fintech")
                              }
                              data-checked={
                                fintech.value === form.getValues("fintech")
                              }
                              value={fintech.label}
                              key={`${fintech.value}-${i}`}
                              onSelect={() => {
                                form.setValue(
                                  "fintech",
                                  fintech.value === form.getValues("fintech")
                                    ? ""
                                    : fintech.value,
                                );
                                // setOpenSelectFintech(false);
                              }}
                              className="aspect-square border rounded-4xl p-0 overflow-hidden"
                              style={{ background: fintech.color }}
                            >
                              <div className="w-full h-full relative p-4 z-0 flex">
                                {/*<p className="z-2 leading-none break-all line-clamp-2">
                                  {fintech.label}
                                </p>*/}
                                <CheckCircle2
                                  className={cn(
                                    "ml-auto z-2 absolute bottom-4 left-1/2 -translate-x-1/2 text-green-500 size-6 drop-shadow-lg bg-background rounded-full",
                                    fintech.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <Image
                                  src={fintech.bg}
                                  className="m-auto -z-10 drop-shadow"
                                  alt={fintech.label}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </div>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                }
              />
            </Field>
          )}
        />
        <Controller
          name="tags"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet className="gap-3">
              <Field data-invalid={fieldState.invalid} orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Tags?</FieldLabel>
                  <FieldDescription>
                    Optional. Add tags for any purpose you want.
                  </FieldDescription>
                  {form.formState.errors.tags?.root && (
                    <FieldError errors={[form.formState.errors.tags.root]} />
                  )}
                </FieldContent>
                <Field className="gap-2 w-fit" orientation="responsive">
                  <Button
                    id={field.name}
                    type="button"
                    variant="secondary"
                    onClick={() => appendTag({ tag: "" })}
                    className="py-0 px-3 text-sm font-bold text-muted-foreground border border-input"
                  >
                    Add Tag
                  </Button>
                  {form.getValues("tags")?.length ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => form.resetField("tags")}
                      className="py-0 px-3 text-sm font-bold"
                    >
                      Reset Tags
                    </Button>
                  ) : null}
                </Field>
              </Field>
              <FieldGroup className="flex flex-row flex-wrap gap-2">
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
                              id={`tag-${index}`}
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
              </FieldGroup>
            </FieldSet>
          )}
        />
        <Controller
          name="reason"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Reason"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="bg-background/50 backdrop-blur-2xl border-t w-full fixed bottom-0 left-1/2 -translate-x-1/2 ">
        <Field
          orientation="horizontal"
          className="gap-2 max-w-lg w-full mx-auto justify-end p-4 "
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              form.reset();
              if (action === "add")
                form.setValue("amount", "" as unknown as number);
            }}
          >
            Reset
          </Button>
          <Button className="capitalize" type="submit" form="money-form">
            {action}
          </Button>
        </Field>
      </div>
    </form>
  );
}
