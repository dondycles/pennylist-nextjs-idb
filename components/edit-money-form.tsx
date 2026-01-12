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
} from "./ui/command";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { Money, moneyFormSchema } from "@/types/Money";
import { useActionConfirmStore } from "@/store/ActionConfirm";
import { FINTECHS } from "@/lib/contants";

export default function EditMoneyForm({ money }: { money: Money }) {
  const {
    setMoneyInAction,
    setOpenDialog,
    setTypeOfAction,
    setMoneyInActionNewData,
  } = useActionConfirmStore();
  const form = useForm<z.infer<typeof moneyFormSchema>>({
    resolver: zodResolver(moneyFormSchema),
    defaultValues: money,
  });

  const {
    fields: tags,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  return (
    <form
      id="edit-money-form"
      className="max-w-lg mx-auto w-full px-4 h-full flex-1 grid"
    >
      <FieldGroup className="h-full">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="edit-money-form-name-input">Name</FieldLabel>
              <Input
                {...field}
                id="edit-money-form-name-input"
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
              <FieldLabel htmlFor="edit-money-form-amount-input">
                Amount
              </FieldLabel>
              <Input
                {...field}
                id="edit-money-form-amount-input"
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
            <Field orientation="responsive" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="edit-money-form-fintech-input">
                  Fintech?
                </FieldLabel>
                <FieldDescription>
                  Optional. But if it is, it would be cool tho.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Popover modal>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-money-form-fintech-input"
                    variant="secondary"
                    role="combobox"
                    className={cn(
                      "py-0 px-3 text-sm font-bold",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? FINTECHS.find(
                          (fintech) => fintech.value === field.value
                        )?.label
                      : "Select fintech"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="end">
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
                                  : fintech.value
                              );
                            }}
                          >
                            {fintech.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                fintech.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
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
        />
        <FieldSet className="gap-3">
          <Field orientation="responsive">
            <FieldContent>
              <FieldLegend variant="label" className="m-0">
                Tags?
              </FieldLegend>
              <FieldDescription>
                Optional. Add tags for any purpose you want.
              </FieldDescription>
              {form.formState.errors.tags?.root && (
                <FieldError errors={[form.formState.errors.tags.root]} />
              )}
            </FieldContent>
            <Field className="gap-2" orientation="responsive">
              <Button
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
                    className="max-w-[calc(25%-6px)]"
                  >
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          {...controllerField}
                          id={`edit-money-form-tag-input-${index}`}
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
        <FieldSeparator className="mt-auto" />
        <Field orientation="horizontal" className="gap-2 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              form.reset();
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={() => {
              setMoneyInAction(money);
              setMoneyInActionNewData(form.getValues());
              setTypeOfAction("editMoney");
              setOpenDialog(true);
            }}
          >
            Edit
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
