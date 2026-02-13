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
import { NumericFormat } from "react-number-format";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
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
import { moneyIntricateSchema, moneyIntricateFormSchema } from "@/types/Money";
import { useMoneysStore } from "@/store/Moneys";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { FINTECHS } from "@/lib/contants";
import { useHistoryStore } from "@/store/History";
import _ from "lodash";
import BottomDrawer from "./bottom-drawer";
import Image from "next/image";
import InpuntWithCurrency from "./input-w-currency";

import Checker from "./checker";
import { memo, useCallback, useMemo, useState } from "react";

// Memoized fintech item to prevent re-renders when other items change
const FintechItem = memo(function FintechItem({
  fintech,
  isSelected,
  onSelect,
}: {
  fintech: (typeof FINTECHS)[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <CommandItem
      aria-checked={isSelected}
      data-checked={isSelected}
      value={fintech.label}
      onSelect={onSelect}
      className="aspect-square border rounded-4xl p-0 overflow-hidden"
      style={{ background: fintech.color }}
    >
      <div className="w-full h-full relative p-4 z-0 flex">
        <Checker checked={isSelected} />
        <Image
          src={fintech.bg}
          className="m-auto -z-10 pointer-events-none"
          alt={fintech.label}
        />
      </div>
    </CommandItem>
  );
});

// Isolated component for form actions that subscribes to isValid
const FormActions = memo(function FormActions({
  control,
  onReset,
}: {
  control: ReturnType<
    typeof useForm<z.infer<typeof moneyIntricateFormSchema>>
  >["control"];
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
        <Button
          disabled={!isValid}
          className="capitalize"
          type="submit"
          form="money-form"
        >
          Add
        </Button>
      </Field>
    </div>
  );
});

// Isolated component for tags that watches tags array
const TagsResetButton = memo(function TagsResetButton({
  control,
  onReset,
}: {
  control: ReturnType<
    typeof useForm<z.infer<typeof moneyIntricateFormSchema>>
  >["control"];
  onReset: () => void;
}) {
  const tags = useWatch({ control, name: "tags" });

  if (!tags?.length) return null;

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={onReset}
      className="py-0 px-3 text-sm font-bold"
    >
      Reset Tags
    </Button>
  );
});

export default function AddMoneyForm() {
  // Memoize the date so it doesn't change on re-renders
  const date = useMemo(() => new Date().toISOString(), []);
  const router = useRouter();

  // Only subscribe to the functions we need, not the moneys array
  const addMoney = useMoneysStore((state) => state.add);
  const getMoneys = useMoneysStore((state) => state.moneys);
  const addHistory = useHistoryStore((state) => state.addHistory);

  const form = useForm<z.infer<typeof moneyIntricateFormSchema>>({
    resolver: zodResolver(moneyIntricateFormSchema),
    defaultValues: {
      id: nanoid(),
      name: "",
      amount: "",
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

  // Memoize handlers to prevent re-renders
  const handleAddTag = useCallback(() => {
    appendTag({ tag: "" });
  }, [appendTag]);

  const handleResetTags = useCallback(() => {
    form.resetField("tags");
  }, [form]);

  const handleReset = useCallback(() => {
    form.reset();
  }, [form]);

  const handleRemoveTag = useCallback(
    (index: number) => {
      removeTag(index);
    },
    [removeTag],
  );

  const onSubmit = useCallback(
    (formData: z.infer<typeof moneyIntricateFormSchema>) => {
      // Use the schema to transform form data (strings to numbers)
      const money = moneyIntricateSchema.parse(formData);

      // Get moneys at submission time, not reactively
      const total_money = _.sum(getMoneys.map((m) => Number(m.amount)));
      addMoney(money);
      addHistory({
        id: nanoid(),
        date_added: date,
        type: "add",
        transfer_history: null,
        edit_or_remove_history: [
          {
            money_id: money.id,
            snapshot: {
              after: money,
            },
          },
        ],
        total_money: {
          before: total_money,
          after: Number(total_money) + Number(money.amount),
        },
      });
      router.push("/list");
    },
    [addMoney, addHistory, date, getMoneys, router],
  );

  // Memoize the fintech select handler factory
  const createFintechSelectHandler = useCallback(
    (fintechValue: string) => () => {
      const currentValue = form.getValues("fintech");
      form.setValue(
        "fintech",
        fintechValue === currentValue ? "" : fintechValue,
      );
    },
    [form],
  );

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
              <NumericFormat
                thousandSeparator
                customInput={InpuntWithCurrency}
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
                content={() => (
                  <Command className="bg-transparent rounded-4xl **:data-[slot='command-input-wrapper']:max-w-lg **:data-[slot='command-input-wrapper']:w-full **:data-[slot='command-input-wrapper']:mx-auto">
                    <CommandInput placeholder="Search fintech..." />
                    <CommandList className="p-4 max-h-full">
                      <CommandEmpty>No fintech found.</CommandEmpty>
                      <CommandGroup>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 max-w-lg mx-auto p-1">
                          {FINTECHS.map((fintech, i) => (
                            <FintechItem
                              key={`${fintech.value}-${i}`}
                              fintech={fintech}
                              isSelected={fintech.value === field.value}
                              onSelect={() => {
                                createFintechSelectHandler(fintech.value)();
                                setTimeout(() => {
                                  setOpenSelectFintech(false);
                                }, 150);
                              }}
                            />
                          ))}
                        </div>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                )}
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
                    onClick={handleAddTag}
                    className="py-0 px-3 text-sm font-bold text-muted-foreground border border-input"
                  >
                    Add Tag
                  </Button>
                  <TagsResetButton
                    control={form.control}
                    onReset={handleResetTags}
                  />
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
                                  onClick={() => handleRemoveTag(index)}
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
      <FormActions control={form.control} onReset={handleReset} />
    </form>
  );
}
