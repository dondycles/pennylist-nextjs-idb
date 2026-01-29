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
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { CheckCircle2, ChevronsUpDown, XIcon } from "lucide-react";
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
import { useState } from "react";
import { useHistoryStore } from "@/store/History";
import { toast } from "sonner";
import _ from "lodash";
import BottomDrawer from "./bottom-drawer";
import Image from "next/image";
import CurrencySign from "./currency-sign";
import InpuntWithCurrency from "./input-w-currency";

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
      ? { ...targetMoney, date_edited: date }
      : {
        id: nanoid(),
        name: "",
        amount: "" as unknown as number,
        fintech: "",
        tags: [],
        date_added: date,
        date_edited: date,
      },
  });

  const [openSelectFintect, setOpenSelectFintech] = useState(false);

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
      editMoney();
    }
  }

  function addMoney(money: z.infer<typeof moneyFormSchema>) {
    if (action !== "add") return;
    const total_money = _.sum(moneys.map((money) => Number(money.amount)));
    add(money);
    addHistory({
      date_added: date,
      id: nanoid(),
      money_id: money.id,
      type: "add",
      snapshot: {
        before: { money: targetMoney, total_money },
        after: {
          money: form.getValues(),
          total_money:
            Number(total_money) -
            Number(targetMoney ? targetMoney.amount : 0) +
            Number(form.getValues("amount")),
        },
      },
    });
    router.push("/list");
  }

  function editMoney() {
    if (action !== "edit") return;
    setMoneyInActionForEditOrRemove(targetMoney);
    setMoneyInActionNewDataForEditOrRemove(form.getValues());
    setTypeOfAction("editMoney");
    setOpenDialog(true);
  }

  return (
    <form
      id="money-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-lg mx-auto w-full px-4 pb-24 flex-1 grid overflow-auto"
    >
      <FieldGroup className="h-full">
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
              <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
              <InpuntWithCurrency aria-invalid={fieldState.invalid} {...field} />
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
                    className="py-0 px-3 text-sm font-bold text-muted-foreground"
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
    </form>
  );
}
