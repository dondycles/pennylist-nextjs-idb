"use client";
import { Main } from "../_main";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useMoneysStore } from "@/store/Moneys";

// export const metadata: Metadata = {
//   title: "Transfer Page",
// };

export default function TransferPage() {
  const { moneys } = useMoneysStore();
  return (
    <Main>
      <Popover modal>
        <PopoverTrigger asChild>
          <Button
            id="money-form-root-transfer-input"
            variant="secondary"
            role="combobox"
            className={cn(
              "py-0 px-3 text-sm font-bold",
              // !field.value && "text-muted-foreground",
            )}
          >
            {/*{field.value
              ? FINTECHS.find((fintech) => fintech.value === field.value)?.label
              : "Select fintech"}*/}
            Select sender money
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
                      //   "fintech",
                      //   fintech.value === form.getValues("fintech")
                      //     ? ""
                      //     : fintech.value,
                      // );
                      // setOpenSelectFintech(false);
                    }}
                  >
                    {m.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        // fintech.value === field.value
                        //   ? "opacity-100"
                        //   : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Main>
  );
}
