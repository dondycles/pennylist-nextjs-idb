import { History } from "@/types/History";
import HistoryTableInfo from "./history-table-info";
import MonetaryValue from "./monetary-value";
import { ChevronDown, Pencil, Plane, Plus, Trash } from "lucide-react";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "./ui/hybrid-tooltip";
import Link from "next/link";

export default function HistoryCard({ history }: { history: History }) {
  return (
    <div className="rounded-4xl flex flex-col bg-muted/75 dark:bg-muted/25 w-full p-6 justify-between relative overflow-hidden">
      <div className="z-2 flex gap-6 justify-between items-start flex-1 text-muted-foreground mb-6 font-bold text-sm">
        <HybridTooltip>
          <HybridTooltipTrigger>
            <span className="capitalize truncate [&>svg]:mr-1.5 [&>svg]:mb-1 [&>svg]:size-3.5  [&>svg]:inline-flex">
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
            <span className="text-xs">
              {new Date(history.date_added).toLocaleString()}
            </span>
          </HybridTooltipTrigger>
          <HybridTooltipContent align="end">
            <p>Date Added</p>
          </HybridTooltipContent>
        </HybridTooltip>
      </div>
      {history.type === "edit" ||
      history.type === "delete" ||
      history.type === "add" ? (
        <EditOrRemoveCard data={history.edit_or_remove_history} />
      ) : (
        <>
          <div className="border border-dashed rounded-3xl overflow-hidden">
            <HistoryTableInfo data={history.transfer_history} />
          </div>
          <ChevronDown className="text-muted-foreground/75 dark:text-muted-foreground/25  mx-auto my-4" />
          <EditOrRemoveCard data={history.edit_or_remove_history} />
        </>
      )}
      <div className="z-2 flex gap-6 justify-between items-end flex-1 text-muted-foreground mt-6">
        <span className="font-bold text-sm">Total Money</span>
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

function EditOrRemoveCard({
  data,
}: {
  data: History["edit_or_remove_history"];
}) {
  const modifiedData = data?.map((d) => ({
    ...d,
    valueChanged:
      Number(d?.snapshot.after?.amount ?? 0) -
      Number(d?.snapshot.before?.amount ?? 0),
  }));
  if (!modifiedData) return null;
  return (
    <div className="flex flex-col gap-6">
      {modifiedData.map((data) => (
        <div
          key={data.money_id}
          className="z-2 flex flex-col gap-6 justify-between items-center flex-1 text-muted-foreground p-6 font-black border border-dashed rounded-3xl"
        >
          <div className="flex gap-6 justify-between w-full items-center">
            <HybridTooltip>
              <HybridTooltipTrigger asChild>
                <Link
                  href={`/money/${data?.snapshot.after?.id}`}
                  className="truncate"
                >
                  {data?.snapshot.after?.name}
                </Link>
              </HybridTooltipTrigger>
              <HybridTooltipContent align="start">
                <p>Money Name</p>
              </HybridTooltipContent>
            </HybridTooltip>
            <HybridTooltip>
              <HybridTooltipTrigger>
                <MonetaryValue
                  amount={data.valueChanged}
                  amountForSign={data.valueChanged > 0 ? 1 : -1}
                  className={`${data.valueChanged > 0 && "text-green-500"} ${
                    data.valueChanged < 0 && "text-red-500"
                  } `}
                />
              </HybridTooltipTrigger>
              <HybridTooltipContent align="end">
                <p>Value Changed</p>
              </HybridTooltipContent>
            </HybridTooltip>
          </div>
          {data.reason && (
            <HybridTooltip>
              <HybridTooltipTrigger asChild>
                <blockquote className="border-l-2 pl-2 pr-1 font-bold text-base whitespace-pre-wrap w-full">
                  &quot;{data.reason}&quot;
                </blockquote>
              </HybridTooltipTrigger>
              <HybridTooltipContent align="end">
                <p>Reason</p>
              </HybridTooltipContent>
            </HybridTooltip>
          )}
        </div>
      ))}
    </div>
  );
}
