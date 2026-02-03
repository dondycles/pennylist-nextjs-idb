"use client";
import { Button } from "./ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronsUpDown, XIcon } from "lucide-react";
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
import { moneyIntricateSchema, moneyBasicSchema } from "@/types/Money";
import { useMoneysStore } from "@/store/Moneys";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { FINTECHS } from "@/lib/contants";
import { useHistoryStore } from "@/store/History";
import _ from "lodash";
import BottomDrawer from "./bottom-drawer";
import Image from "next/image";
import InpuntWithCurrency from "./input-w-currency";
import MonetaryValue from "./monetary-value";

import Checker from "./checker";
import { useState } from "react";
export default function AddMoneyForm() {
  const date = new Date().toISOString();
  const router = useRouter();
  const { add, moneys } = useMoneysStore();
  const { addHistory } = useHistoryStore();

  const form = useForm<z.infer<typeof moneyBasicSchema>>({
    resolver: zodResolver(moneyBasicSchema),
    defaultValues: {
      id: nanoid(),
      name: "",
      amount: "" as unknown as number,
      fintech: "",
      tags: [],
      date_added: date,
      date_edited: date,
    },
    mode: "onChange",
    reValidateMode: "onChange",
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

  function onSubmit(money: z.infer<typeof moneyIntricateSchema>) {
    addMoney(money);
  }

  function addMoney(money: z.infer<typeof moneyIntricateSchema>) {
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
        after: Number(total_money) + Number(form.getValues("amount")),
      },
    });
    router.push("/list");
  }

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
              <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
              <InpuntWithCurrency
                id={field.name}
                aria-invalid={fieldState.invalid}
                min={0}
                {...field}
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
            Add
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
