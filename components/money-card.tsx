import { Money } from "@/types/Money";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { formatter } from "@/lib/utils";

export default function MoneyCard({
  money,
  doAction,
  withOptions = true,
}: {
  money: Money;
  doAction?: (type: "edit" | "remove") => void;
  withOptions?: boolean;
}) {
  return (
    <div
      key={money.id}
      className="rounded-4xl flex bg-muted/25 w-full p-6 gap-6 justify-between"
    >
      <div className="space-y-2 grid">
        <p className="font-black text-muted-foreground truncate">
          {money.name}{" "}
          {money.tags?.map((tag, i) => (
            <span key={`${money.name}-#${tag.tag}-${i}`}>
              #{tag.tag.toLowerCase()}
            </span>
          ))}
        </p>
        <p className="font-black text-4xl truncate">
          {formatter.format(money.amount)}
        </p>
      </div>
      {withOptions ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"icon"} className="size-fit p-2" variant={"ghost"}>
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
    </div>
  );
}
