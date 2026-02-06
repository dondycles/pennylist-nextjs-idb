import { History } from "@/types/History";
import MonetaryValue from "./monetary-value";
import {
  ChevronDown,
  CircleQuestionMark,
  Pencil,
  Plane,
  Plus,
  Trash,
} from "lucide-react";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "./ui/hybrid-tooltip";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import useMeasure from "react-use-measure";

export default function HistoryCard({ history }: { history: History }) {
  return (
    <div className="rounded-4xl flex flex-col bg-muted/75 dark:bg-muted/25 w-full p-6 justify-between relative overflow-hidden">
      <div className="z-2 flex gap-6 justify-between items-start flex-1 text-muted-foreground mb-6 font-bold">
        <HybridTooltip>
          <HybridTooltipTrigger>
            <span className="capitalize truncate [&>svg]:mr-1.5 [&>svg]:mb-1 [&>svg]:size-3.5  [&>svg]:inline-flex text-base">
              {history.type === "add" ? <Plus /> : null}
              {history.type === "delete" ? <Trash /> : null}
              {history.type === "transfer" ? <Plane /> : null}
              {history.type === "edit" ? <Pencil /> : null}
              {history.type}
            </span>
          </HybridTooltipTrigger>
          <HybridTooltipContent align="start">
            <p>Type of Transaction</p>
          </HybridTooltipContent>
        </HybridTooltip>
        <HybridTooltip>
          <HybridTooltipTrigger>
            <span className="text-sm">
              {new Date(history.date_added).toLocaleString()}
            </span>
          </HybridTooltipTrigger>
          <HybridTooltipContent align="end">
            <p>Date Added</p>
          </HybridTooltipContent>
        </HybridTooltip>
      </div>
      <Data history={history} />
      <div className="z-2 flex gap-6 justify-between items-end flex-1 text-muted-foreground mt-6">
        <span className="text-base font-bold">Total Money</span>
        <HybridTooltip>
          <HybridTooltipTrigger>
            <MonetaryValue amount={history.total_money.after ?? 0} />
          </HybridTooltipTrigger>
          <HybridTooltipContent align="end">
            <p>Total Money After Transaction</p>
          </HybridTooltipContent>
        </HybridTooltip>
      </div>
    </div>
  );
}

function Data({ history }: { history: History }) {
  const [firstNodeRef, { y: firstNodeY }] = useMeasure({
    debounce: 0,
    scroll: true,
  });

  const [lastNodeRef, { y: lastNodeY }] = useMeasure({
    debounce: 0,
    scroll: true,
  });

  if (history.type === "transfer") {
    const modifiedData = history?.edit_or_remove_history?.map((d) => ({
      ...d,
      valueChanged:
        Number(d?.snapshot.after?.amount ?? 0) -
        Number(d?.snapshot.before?.amount ?? 0),
      fee:
        history?.transfer_history?.receiverMoneys?.find(
          (m) => m.id === d.money_id,
        )?.fee ?? 0,
      type: (history.transfer_history?.receiverMoneys?.some(
        (m) => m.id === d.money_id,
      )
        ? "receiver"
        : "sender") as "receiver" | "sender",
    }));

    const sender = modifiedData?.filter((f) => f.type === "sender");
    const receiver = modifiedData?.filter((f) => f.type === "receiver");

    if (!modifiedData) return null;
    if (sender?.length !== 1) {
      return null;
    }
    if (!receiver) {
      return null;
    }
    return (
      <div className="relative overflowhidden">
        {/* Sender */}
        <div className="relative flex items-start gap-4" ref={firstNodeRef}>
          {/* Timeline node */}

          <div className="relative flex flex-col items-center mt-8 z-1">
            <div className="size-3 rounded-full bg-red-500 ring-4 ring-red-500/20 z-10" />
            {receiver.length > 0 && (
              <div
                className="w-0.5 h-full absolute top-1/2 bg-linear-to-b from-red-500 to-green-500"
                style={{
                  height: lastNodeY - firstNodeY,
                }}
              />
            )}
          </div>
          {/* Content */}
          <div className="flex-1">
            <Item data={sender[0]} history={history} />
          </div>
        </div>

        {/* Receivers */}
        {receiver.map((data, index) => (
          <div
            key={data.money_id}
            className="relative flex items-start gap-4 mt-6 ml-8"
            ref={index === receiver.length - 1 ? lastNodeRef : null}
          >
            {/* Timeline node */}
            <div className="relative flex flex-col items-center mt-8 ">
              <div className="absolute right-0 h-0.5 bg-green-500  z-0 w-9.75 bottom-1/2 translate-y-1/2 " />
              <div className="size-3 rounded-full bg-green-500 ring-4 ring-green-500/20 z-10" />
            </div>
            {/* Content */}
            <div className="flex-1">
              <Item data={data} history={history} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const firstEntry = history.edit_or_remove_history?.[0];
  if (!firstEntry) return null;

  return (
    <Item
      data={{
        ...firstEntry,
        valueChanged:
          Number(firstEntry.snapshot.after?.amount ?? 0) -
          Number(firstEntry.snapshot.before?.amount ?? 0),
      }}
      history={history}
    />
  );
}

function Item({
  data,
  history,
  className,
}: {
  data: NonNullable<History["edit_or_remove_history"]>[number] & {
    valueChanged: number;
    fee?: number;
    type?: "receiver" | "sender";
  };
  history: History;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "z-2 flex flex-col gap-2 justify-between items-center flex-1 text-muted-foreground p-6 font-bold text-base border border-dashed rounded-3xl",
        className,
      )}
    >
      <div className="flex gap-6 justify-between w-full items-start">
        <Link href={`/money/${data?.snapshot.after?.id}`} className="truncate">
          {data?.snapshot.after?.name}
        </Link>
        <HybridTooltip>
          <HybridTooltipTrigger>
            <MonetaryValue
              amount={data.valueChanged}
              amountForSign={data.valueChanged > 0 ? 1 : -1}
              className={`${data.valueChanged > 0 && "text-green-500"} ${
                data.valueChanged < 0 && "text-red-500"
              } `}
              variant={"allBase"}
            />
          </HybridTooltipTrigger>
          <HybridTooltipContent align="end">
            <p>Value Changed</p>
          </HybridTooltipContent>
        </HybridTooltip>
      </div>
      {data.reason ? (
        <blockquote className="border-l-2 pl-2 pr-1 font-normal text-base whitespace-pre-wrap w-full my-2">
          &quot;{data.reason}&quot;
        </blockquote>
      ) : null}
      {data.type === "sender" ? (
        <Popover>
          <PopoverTrigger asChild>
            <div className="w-full items-start font-normal text-sm text-right ">
              <span className="truncate">
                <CircleQuestionMark className="inline-flex mb-1 text-muted-foreground/75 dark:text-muted-foreground/25 size-4" />{" "}
                Transfer Fees:{" "}
              </span>
              <MonetaryValue
                amount={
                  history.transfer_history?.receiverMoneys.reduce(
                    (acc, money) => acc + (money.fee ?? 0),
                    0,
                  ) ?? 0
                }
                variant={"allBase"}
                className="font-normal [&>span[data-slot='sign']]:text-sm [&>span[data-slot='amount']]:text-sm "
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" side="top">
            <p className="font-bold mb-2 text-sm">Transfer Fees</p>
            {history.transfer_history?.receiverMoneys.map((money) => (
              <div key={money.id} className="flex justify-between text-base ">
                <span>To {money.name}: </span>
                <MonetaryValue
                  amount={money.fee ?? 0}
                  variant={"allBase"}
                  className="font-normal [&>span[data-slot='sign']]:text-sm [&>span[data-slot='amount']]:text-sm "
                />
              </div>
            ))}
          </PopoverContent>
        </Popover>
      ) : null}

      <div className="w-full items-start font-normal text-sm text-right">
        <span className="truncate">Prev. Amount: </span>
        <MonetaryValue
          amount={data.snapshot.before?.amount ?? 0}
          variant={"allBase"}
          className="font-normal [&>span[data-slot='sign']]:text-sm [&>span[data-slot='amount']]:text-sm "
        />
      </div>
      <div className="w-full items-start font-normal text-sm text-right">
        <span className="truncate">Final Amount: </span>
        <MonetaryValue
          amount={data.snapshot.after?.amount ?? 0}
          variant={"allBase"}
          className="font-normal [&>span[data-slot='sign']]:text-sm [&>span[data-slot='amount']]:text-sm "
        />
      </div>
    </div>
  );
}
