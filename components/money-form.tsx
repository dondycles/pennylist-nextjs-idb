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
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { ChevronsUpDown, Minus, Plus, XIcon } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "./ui/separator";
import Checker from "./checker";
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
          reason: "",
          adjustmentType: "manual",
        }
      : {
          id: nanoid(),
          name: "",
          amount: "" as unknown as number,
          fintech: "",
          tags: [],
          date_added: date,
          date_edited: date,
          amountChange: undefined,
          operation: undefined,
          reason: undefined,
          adjustmentType: undefined,
        },
    mode: "onChange",
    reValidateMode: "onChange",
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

  const adjustmentType = useWatch({
    control: form.control,
    name: "adjustmentType",
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
    if (
      _.isEqual(
        _.pick(money, "amount", "name", "fintech", "tags"),
        _.pick(targetMoney, "amount", "name", "fintech", "tags"),
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
    add({
      ...money,
      amountChange: undefined,
      reason: undefined,
      operation: undefined,
    });
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

  // useEffect(() => {
  //   const diff = Number(targetMoney?.amount ?? 0) - amount;
  //   form.setValue("operation", diff > 0 ? "deduct" : "add");
  //   form.setValue("amountChange", Math.abs(diff));
  // }, [amount, form]);

  useEffect(() => {
    form.setValue("amountChange", "" as unknown as number);
    if (targetMoney) form.setValue("amount", targetMoney.amount);
  }, [adjustmentType, form, targetMoney?.amount]);

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
        {!targetMoney ? (
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {targetMoney ? "Current " : null}Amount
                </FieldLabel>
                <InpuntWithCurrency
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  min={0}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ) : (
          <Controller
            name="adjustmentType"
            control={form.control}
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label">Amount</FieldLegend>
                <div className="border border-dashed rounded-3xl p-4 space-y-4">
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    className="[&>*>*>svg]:size-4 grid-cols-[1fr_1fr] gap-4"
                  >
                    {["manual", "addDeduct"].map((type) => (
                      <Field
                        key={type}
                        orientation="horizontal"
                        className="bg-muted rounded-full px-3 border border-input h-9"
                      >
                        <RadioGroupItem value={type} id={type} />
                        <FieldLabel
                          htmlFor={type}
                          className="capitalize text-base font-bold h-full"
                        >
                          {type === "addDeduct" ? "Add/Deduct" : type}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                  {field.value === "manual" ? (
                    <>
                      <Controller
                        name="amount"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldContent>
                              <FieldLabel
                                className="sr-only"
                                htmlFor={field.name}
                              >
                                Manual adjustment
                              </FieldLabel>
                              <FieldDescription>
                                Manually set the amount
                              </FieldDescription>
                            </FieldContent>
                            <InpuntWithCurrency
                              aria-invalid={fieldState.invalid}
                              id={field.name}
                              min={0}
                              {...field}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Separator className="opacity-50" />
                      <Item
                        name="Difference"
                        amount={targetMoney.amount - Number(amount)}
                        amountForSign={
                          targetMoney.amount - Number(amount) <= 0
                            ? targetMoney.amount - Number(amount) === 0
                              ? 0
                              : 1
                            : -1
                        }
                      />
                    </>
                  ) : null}
                  {field.value === "addDeduct" ? (
                    <>
                      <Controller
                        name="amountChange"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldContent>
                              <FieldLabel
                                className="sr-only"
                                htmlFor={field.name}
                              >
                                Add/Deduct adjustment
                              </FieldLabel>
                              <FieldDescription>
                                Add or deduct from the current amount
                              </FieldDescription>
                            </FieldContent>
                            <div className="flex flex-row gap-2 *:data-[slot=input-w-currency-container]:w-full">
                              <Controller
                                name="operation"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                  <FieldSet data-invalid={fieldState.invalid}>
                                    <RadioGroup
                                      name={field.name}
                                      value={field.value}
                                      onValueChange={field.onChange}
                                      aria-invalid={fieldState.invalid}
                                      className="[&>*>*>svg]:size-4 flex gap-2"
                                    >
                                      {["add", "deduct"].map((operation) => (
                                        <Field
                                          key={operation}
                                          orientation="horizontal"
                                          className={`bg-muted rounded-full size-9  border border-input ${field.value === operation ? "ring-muted-foreground ring-2 " : ""}`}
                                        >
                                          <RadioGroupItem
                                            value={operation}
                                            id={operation}
                                            className="sr-only"
                                          />
                                          <FieldLabel
                                            htmlFor={operation}
                                            className="flex items-center justify-center w-full h-full rounded-full"
                                          >
                                            {operation === "add" ? (
                                              <Plus />
                                            ) : (
                                              <Minus />
                                            )}
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
                              <InpuntWithCurrency
                                min={0}
                                aria-invalid={fieldState.invalid}
                                amountForSign={operation === "add" ? 1 : -1}
                                id={field.name}
                                {...field}
                                className="flex-1"
                              />
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      <Separator className="opacity-50" />
                      <div className="space-y-2">
                        {[
                          {
                            name: "Current Amount",
                            amount: targetMoney.amount,
                            amountForSign: undefined,
                          },
                          {
                            name: "Final Amount",
                            amount:
                              operation === "add"
                                ? Number(amount ?? 0) +
                                  Number(amountChange ?? 0)
                                : Number(amount ?? 0) -
                                  Number(amountChange ?? 0),
                            amountForSign:
                              operation === "add"
                                ? 0
                                : Number(amount ?? 0) -
                                      Number(amountChange ?? 0) >=
                                    0
                                  ? 0
                                  : -1,
                          },
                        ].map((item) => (
                          <Item key={item.name} {...item} />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </FieldSet>
            )}
          />
        )}

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

                                <Checker
                                  checked={fintech.value === field.value}
                                />
                                <Image
                                  src={fintech.bg}
                                  className="m-auto -z-10 pointer-events-none"
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
        {action === "edit" ? (
          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
                  <FieldDescription>
                    Optional but will help you in the future.
                  </FieldDescription>
                </FieldContent>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. 'Bought a coffee'."
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ) : null}
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
              if (action === "add")
                form.setValue("amount", "" as unknown as number);
            }}
          >
            Reset
          </Button>
          <Button
            disabled={!form.formState.isValid}
            className="capitalize"
            type="submit"
            form="money-form"
          >
            {action}
          </Button>
        </Field>
      </div>
    </form>
  );
}

function Item(item: { name: string; amount: number; amountForSign?: number }) {
  return (
    <div key={item.name} className="flex flex-row gap-4 [&>*]:w-fit">
      <span className="mt-auto flex-1 text-muted-foreground text-sm">
        {item.name}:
      </span>
      <MonetaryValue
        amount={item.amount}
        amountForSign={item.amountForSign}
        variant={"allBase"}
        className={`${item.amountForSign === -1 ? "text-destructive" : ""}`}
      />
    </div>
  );
}
