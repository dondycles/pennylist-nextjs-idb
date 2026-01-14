import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LIST_ORDER_OPTIONS, ListOrderByOptions } from "@/lib/contants";
import { Check, ChevronsUpDown } from "lucide-react";
import { useListOrderStore } from "@/store/ListOrder";
import { ModeToggle } from "./theme-toggle";

export default function SettingsDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const { order, setOrder } = useListOrderStore();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Setting</DialogTitle>
          <DialogDescription>Set things below.</DialogDescription>
        </DialogHeader>
        {/* <pre>{JSON.stringify(order, null, 2)}</pre> */}
        <div className="bg-muted dark:bg-muted/25 rounded-3xl p-4 flex flex-wrap gap-2 justify-between items-center truncate">
          <p className="font-black text-muted-foreground">List order by</p>
          <div className="flex gap-2 justify-end flex-wrap ml-auto mr-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="py-0 px-3 text-sm font-bold capitalize"
                >
                  {order.by} <ChevronsUpDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LIST_ORDER_OPTIONS.map((opt) => opt.by).map((by) => (
                  <DropdownMenuItem
                    onClick={() => {
                      setOrder({ ...order, by });
                    }}
                    key={by}
                    className="capitalize"
                  >
                    {by}
                    {by === order.by ? <Check /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="py-0 px-3 text-sm font-bold"
                >
                  {
                    LIST_ORDER_OPTIONS.find(
                      (o) => o.by === order.by
                    )?.flow.find((f) => f.value === order.flow[0].value)?.label
                  }
                  <ChevronsUpDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LIST_ORDER_OPTIONS.find((o) => o.by === order.by)?.flow.map(
                  (flow) => (
                    <DropdownMenuItem
                      onClick={() => {
                        setOrder({ ...order, flow: [flow] });
                      }}
                      key={flow.value}
                    >
                      {flow.label}
                      {flow.value === order.flow[0].value ? <Check /> : null}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="bg-muted dark:bg-muted/25 rounded-3xl p-4 truncate flex gap-2 justify-between items-center flex-wrap">
          <p className="font-black text-muted-foreground">Theme</p>
          <ModeToggle />
        </div>
      </DialogContent>
    </Dialog>
  );
}
