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
  ChevronsUpDown,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Upload,
} from "lucide-react";
import { useListSettingsStore } from "@/store/ListSettings";
import { ModeToggle } from "./theme-toggle";
import Loader from "./loader";
import { CurrencySelect } from "./currency-select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ButtonGroup, ButtonGroupSeparator } from "./ui/button-group";
import { useActionConfirmStore } from "@/store/ActionConfirm";
import { nanoid } from "nanoid";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Set things below.</DialogDescription>
        </DialogHeader>
        {/* <pre>{JSON.stringify(order, null, 2)}</pre> */}
        {!_hasHydrated ? (
          <Loader />
        ) : (
          <>
            <MiniCard
              title="List order by"
              description="Set the order of the list."
              render={(id) => (
                <div className="flex gap-2 justify-end flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id={id}
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
                          {flow.value === order.flow[0].value ? (
                            <Check />
                          ) : null}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            />

            <MiniCard
              title="Theme"
              description="Set the theme of the app."
              render={(id) => <ModeToggle id={id} />}
            />
            <MiniCard
              title="Currency"
              description="Set the currency of the app."
              render={(id) => (
                <CurrencySelect
                  name={id}
                  value={currency}
                  onCurrencySelect={(c) => setCurrency(c.code)}
                />
              )}
            />
            <MiniCard
              title="Hide numbers"
              description="Hide the numbers in the list."
              render={(id) => (
                <div>
                  <div className="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium -mr-3">
                    <Switch
                      id={id}
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
                </div>
              )}
            />

            <MiniCard
              title="Import/Export"
              description="Import or export your data."
              render={(id) => (
                <ButtonGroup id={id}>
                  <Button variant="secondary" size="icon">
                    <Download />
                  </Button>
                  <ButtonGroupSeparator />
                  <Button variant="secondary" size="icon">
                    <Upload />
                  </Button>
                </ButtonGroup>
              )}
            />
            <MiniCard
              title="Clear data"
              description="Clear all your data."
              render={(id) => (
                <Button
                  onClick={() => {
                    setTypeOfAction("reset");
                    setOpenDialog(true);
                  }}
                  variant="destructive"
                  size="icon"
                  id={id}
                >
                  <Trash2 />
                </Button>
              )}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MiniCard({
  render,
  title,
  description,
}: {
  render: (id: string) => React.ReactElement;
  title: string;
  description?: string;
}) {
  const id = nanoid();
  return (
    <div className="bg-muted dark:bg-muted/25 rounded-3xl p-4 flex mxs:flex-row flex-col gap-2 justify-end items-end mxs:items-center">
      <div className="grid flex-1 w-full">
        <Label htmlFor={id}>{title}</Label>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>
      {render(id)}
    </div>
  );
}
