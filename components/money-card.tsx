import { BasicMoney } from "@/types/Money";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import Image from "next/image";
import { FINTECHS } from "@/lib/contants";
import MonetaryValue from "./monetary-value";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

export default function MoneyCard({
  money,
  doAction,
  withOptions = true,
  className,
  oldMoney,
}: {
  money: BasicMoney;
  doAction?: (type: "edit" | "remove" | "transfer") => void;
  withOptions?: boolean;
  className?: string;
  oldMoney?: BasicMoney;
}) {
  const fintechData = FINTECHS.find(
    (fintech) => fintech.value === money.fintech,
  );
  return (
    <div
      className={cn(
        "rounded-4xl flex bg-muted/75 dark:bg-muted/25 w-full p-6 justify-between relative overflow-hidden",
        className,
      )}
    >
      <div className="grid z-2 flex-1">
        <p className="font-bold text-muted-foreground truncate">
          <span>{money.name}</span>
          {money.tags?.map((tag, i) => (
            <span
              className="text-foreground/25"
              key={`${money.name}-#${tag.tag}-${i}`}
            >
              {" "}
              #{tag.tag.toLowerCase()}{" "}
            </span>
          ))}
        </p>
        <MonetaryValue amount={money.amount ?? 0} />
        {oldMoney ? (
          <Badge
            className={`ml-auto mr-0 ${oldMoney.amount - money.amount < 0 ? "bg-green-500" : "bg-red-500"}`}
          >
            <MonetaryValue
              amount={oldMoney.amount - money.amount}
              variant={"allBase"}
              amountForSign={oldMoney.amount - money.amount < 0 ? 1 : -1}
            />
          </Badge>
        ) : null}
      </div>
      {withOptions ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size={"icon"}
              className="size-fit p-2 z-2"
              variant={"ghost"}
            >
              <Ellipsis className="rotate-90 text-muted-foreground size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                doAction!("edit");
              }}
            >
              <Pencil />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                doAction!("remove");
              }}
            >
              <Trash className="text-destructive" /> <p>Delete</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <div className="absolute top-0 left-1/2 w-full h-full z-0  opacity-10 pointer-events-none">
        {fintechData ? (
          fintechData.bg ? (
            <Image
              alt={`${fintechData.label}-${money.name}`}
              src={fintechData.bg}
              className="w-auto h-[125%] object-cover object-left"
            />
          ) : null
        ) : null}
      </div>
    </div>
  );
}
