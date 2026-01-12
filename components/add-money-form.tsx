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
import { toast } from "sonner";
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
import { moneyFormSchema } from "@/types/Money";
import { useMoneysStore } from "@/store/MoneysStore";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { FINTECHS } from "@/lib/contants";

export default function AddMoneyForm() {
  const router = useRouter();
  const { add } = useMoneysStore();
  const form = useForm<z.infer<typeof moneyFormSchema>>({
    resolver: zodResolver(moneyFormSchema),
    defaultValues: {
      id: nanoid(),
      name: "",
      amount: undefined,
      fintech: "",
      tags: [],
    },
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
    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(money, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });
    add(money);
    form.reset();
    form.setValue("amount", "" as unknown as number);
    router.push("/list");
  }
  return (
    <form
      id="add-money-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-lg mx-auto w-full px-4 h-full flex-1 grid"
    >
      <FieldGroup className="h-full">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="add-money-form-name-input">Name</FieldLabel>
              <Input
                {...field}
                id="add-money-form-name-input"
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
              <FieldLabel htmlFor="add-money-form-amount-input">
                Amount
              </FieldLabel>
              <Input
                {...field}
                id="add-money-form-amount-input"
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
                <FieldLabel htmlFor="add-money-form-fintech-input">
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
                    id="add-money-form-fintech-input"
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
                          id={`add-money-form-tag-input-${index}`}
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
              form.setValue("amount", "" as unknown as number);
            }}
          >
            Reset
          </Button>
          <Button type="submit" form="add-money-form">
            Add
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
