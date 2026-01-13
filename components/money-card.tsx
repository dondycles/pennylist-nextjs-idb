import { Money } from "@/types/Money";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { amountFormat } from "@/lib/utils";
import Image from "next/image";
import { FINTECHS } from "@/lib/contants";

export default function MoneyCard({
  money,
  doAction,
  withOptions = true,
}: {
  money: Money;
  doAction?: (type: "edit" | "remove") => void;
  withOptions?: boolean;
}) {
  const fintechData = FINTECHS.find(
    (fintech) => fintech.value === money.fintech
  );
  return (
    <div
      key={money.id}
      className="rounded-4xl flex bg-muted/25 w-full p-6 justify-between relative overflow-hidden"
    >
      <div className="grid z-2">
        <p className="font-black text-muted-foreground truncate">
          <span>{money.name} </span>
          {money.tags?.map((tag, i) => (
            <span
              className="text-foreground/25"
              key={`${money.name}-#${tag.tag}-${i}`}
            >
              #{tag.tag.toLowerCase()}{" "}
            </span>
          ))}
        </p>
        <p className="font-black text-4xl truncate">
          {amountFormat.format(money.amount)}
        </p>
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
