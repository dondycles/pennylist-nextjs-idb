import React from "react";

import { cn } from "@/lib/utils";

// data
import { currencies as AllCurrencies } from "country-data-list";

// radix-ui
import type { SelectProps } from "@radix-ui/react-select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// types

export interface Currency {
  code: string;
  decimals: number;
  name: string;
  number: string;
  symbol?: string;
}

// constants
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

interface CurrencySelectProps extends Omit<SelectProps, "onValueChange"> {
  onValueChange?: (value: string) => void;
  onCurrencySelect?: (currency: Currency) => void;
  placeholder?: string;
  currencies?: "custom" | "all";
  variant?: "default" | "small";
  valid?: boolean;
}

const CurrencySelect = React.forwardRef<HTMLButtonElement, CurrencySelectProps>(
  (
    {
      value,
      onValueChange,
      onCurrencySelect,
      currencies = "withdrawal",
      valid = true,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const [selectedCurrency, setSelectedCurrency] =
      React.useState<Currency | null>(null);

    const uniqueCurrencies = React.useMemo<Currency[]>(() => {
      const currencyMap = new Map<string, Currency>();

      AllCurrencies.all.forEach((currency: Currency) => {
        if (currency.code && currency.name && currency.symbol) {
          // Special handling for Euro
          if (currency.code === "EUR") {
            currencyMap.set(currency.code, {
              code: currency.code,
              name: "Euro",
              symbol: currency.symbol,
              decimals: currency.decimals,
              number: currency.number,
            });
          } else {
            currencyMap.set(currency.code, {
              code: currency.code,
              name: currency.name,
              symbol: currency.symbol,
              decimals: currency.decimals,
              number: currency.number,
            });
          }
        }
      });

      // Convert the map to an array and sort by currency name
      return Array.from(currencyMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }, [currencies]);

    const handleValueChange = (newValue: string) => {
      const fullCurrencyData = uniqueCurrencies.find(
        (curr) => curr.code === newValue
      );
      if (fullCurrencyData) {
        setSelectedCurrency(fullCurrencyData);
        if (onValueChange) {
          onValueChange(newValue);
        }
        if (onCurrencySelect) {
          onCurrencySelect(fullCurrencyData);
        }
      }
    };

    void selectedCurrency;

    return (
      <Popover modal open={open} onOpenChange={setOpen} {...props}>
        <PopoverTrigger data-valid={valid} ref={ref} asChild>
          <Button
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            className="py-0 px-3 text-sm font-bold"
            data-valid={valid}
          >
            {value ?? "Select currency"}
            <ChevronsUpDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="p-0">
          <Command className="rounded-4xl">
            <CommandInput placeholder="Search currency..." />
            <CommandList>
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup>
                {uniqueCurrencies.map((currency) => (
                  <CommandItem
                    key={currency.code}
                    value={currency.code}
                    onSelect={(currentValue) => {
                      handleValueChange(
                        currentValue === value ? "" : currentValue
                      );
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center w-full gap-2">
                      <span className="text-sm text-muted-foreground w-8 text-left">
                        {currency?.code}
                      </span>
                      <span className="hidden">{currency?.symbol}</span>
                      <span>{currency?.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto",
                        value === currency.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

CurrencySelect.displayName = "CurrencySelect";

export { CurrencySelect };
