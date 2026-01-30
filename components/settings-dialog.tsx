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
import { LIST_ORDER_OPTIONS } from "@/lib/contants";
import {
  Check,
  CheckIcon,
  ChevronsUpDown,
  Download,
  Eye,
  EyeClosed,
  EyeOff,
  Trash2,
  Upload,
  XIcon,
} from "lucide-react";
import { useListSettingsStore } from "@/store/ListSettings";
import { ModeToggle } from "./theme-toggle";
import Loader from "./loader";
import { CurrencySelect } from "./currency-select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./ui/button-group";
import { useMoneysStore } from "@/store/Moneys";
import { useHistoryStore } from "@/store/History";
import { useActionConfirmStore } from "@/store/ActionConfirm";
export default function SettingsDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    order,
    setOrder,
    _hasHydrated,
    currency,
    setCurrency,
    hideNumbers,
    setHideNumbers,
  } = useListSettingsStore();
  const { setOpenDialog, setTypeOfAction } = useActionConfirmStore();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Set things below.</DialogDescription>
        </DialogHeader>
        {/* <pre>{JSON.stringify(order, null, 2)}</pre> */}
        {!_hasHydrated ? (
          <Loader />
        ) : (
          <>
            <MiniCard>
              <Label htmlFor="order">List order by</Label>
              <div className="flex gap-2 justify-end flex-wrap ml-auto mr-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      id="order"
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
                          (o) => o.by === order.by,
                        )?.flow.find((f) => f.value === order.flow[0].value)
                          ?.label
                      }
                      <ChevronsUpDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {LIST_ORDER_OPTIONS.find(
                      (o) => o.by === order.by,
                    )?.flow.map((flow) => (
                      <DropdownMenuItem
                        onClick={() => {
                          setOrder({ ...order, flow: [flow] });
                        }}
                        key={flow.value}
                      >
                        {flow.label}
                        {flow.value === order.flow[0].value ? <Check /> : null}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </MiniCard>
            <MiniCard>
              <Label htmlFor="theme">Theme</Label>
              <ModeToggle />
            </MiniCard>
            <MiniCard>
              <Label htmlFor="currency-select">Currency</Label>
              <CurrencySelect
                name="currency"
                value={currency}
                onCurrencySelect={(c) => setCurrency(c.code)}
              />
            </MiniCard>
            <MiniCard>
              <Label htmlFor="hide-numbers">Hide numbers</Label>
              <div className="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium -mr-3">
                <Switch
                  id="hide-numbers"
                  className="peer absolute inset-0 h-[inherit] w-14 [&_span]:z-10 [&_span]:size-6.5 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-7 [&_span]:data-[state=checked]:rtl:-translate-x-7"
                  aria-label="Switch with permanent icon indicators"
                  onCheckedChange={setHideNumbers}
                  checked={hideNumbers}
                />
                <span className="pointer-events-none relative ml-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-6 peer-data-[state=unchecked]:rtl:-translate-x-6">
                  <Eye className="size-4" aria-hidden="true" />
                </span>
                <span className="peer-data-[state=checked]:text-background pointer-events-none relative flex min-w-8 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible peer-data-[state=checked]:rtl:translate-x-full">
                  <EyeOff className="size-4" aria-hidden="true" />
                </span>
              </div>
            </MiniCard>
            <MiniCard>
              <Label htmlFor="import-export">Import/Export </Label>
              <ButtonGroup id="import-export">
                <Button variant="secondary" size="icon">
                  <Download />
                </Button>
                <ButtonGroupSeparator />
                <Button variant="secondary" size="icon">
                  <Upload />
                </Button>
              </ButtonGroup>
            </MiniCard>
            <MiniCard>
              <Label htmlFor="clear-data">Clear data</Label>
              <Button
                onClick={() => {
                  setTypeOfAction("reset");
                  setOpenDialog(true);
                }}
                variant="destructive"
                size="icon"
              >
                <Trash2 />
              </Button>
            </MiniCard>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MiniCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted dark:bg-muted/25 rounded-3xl p-4 flex flex-wrap gap-2 justify-between items-center truncate">
      {children}
    </div>
  );
}
