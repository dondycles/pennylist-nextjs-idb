// import { FINTECHS } from "@/lib/contants";
import { History } from "@/types/History";
// import Image from "next/image";
import HistoryTableInfo from "./history-table-info";
import MonetaryValue from "./monetary-value";
import { ChevronDown, Pencil, Plane, Plus, Trash } from "lucide-react";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "./ui/hybrid-tooltip";

export default function HistoryCard({ history }: { history: History }) {
  // const transferData = history.transfer_history;
  // const editOrRemoveData = history.edit_or_remove_history;l

  // const total_money_after_transaction =
  //   transferData?.snapshot.after.total_money ??
  //   editOrRemoveData?.reduce((acc, data) => {
  //     return acc + Number(data.snapshot.after.money?.amount ?? 0);
  //   }, 0);

  return (
    <div className="rounded-4xl flex flex-col bg-muted/75 dark:bg-muted/25 w-full p-6 justify-between relative overflow-hidden">
      <div className="z-2 flex gap-6 justify-between items-start flex-1  font-normal text-muted-foreground border-b pb-4">
        <HybridTooltip>
          <HybridTooltipTrigger>
            <span className="capitalize truncate [&>svg]:mr-1.5 [&>svg]:size-4 [&>svg]:inline-flex">
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
            <span>{new Date(history.date_added).toLocaleString()}</span>
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
          <div className="bg-muted/25 rounded-3xl mt-4 overflow-hidden">
            <HistoryTableInfo data={history.transfer_history} />
          </div>
          <ChevronDown className="text-muted-foreground mx-auto my-2" />
          <div className="bg-muted/25 px-4 rounded-3xl mb-4 [&>div>div]:-mx-4 [&>div>div]:px-4">
            <EditOrRemoveCard data={history.edit_or_remove_history} />
          </div>
        </>
      )}
      <div className="z-2 flex gap-6 justify-end items-start flex-1 font-normal text-muted-foreground border-t pt-4">
        <HybridTooltip>
          <HybridTooltipTrigger>
            <MonetaryValue
              amount={history.total_money.after ?? 0}
              variant="sm"
            />
          </HybridTooltipTrigger>
          <HybridTooltipContent align="end">
            <p>Total Money After Transaction</p>
          </HybridTooltipContent>
        </HybridTooltip>
      </div>
      {/* <div className="absolute top-0 left-1/2 w-full h-full z-0  opacity-10 pointer-events-none">
        {fintechData ? (
          fintechData.bg ? (
            <Image
              alt={`${fintechData.label}-${editOrRemoveData?.snapshot.after.money?.name}`}
              src={fintechData.bg}
              className="w-auto h-[125%] object-cover object-left"
            />
          ) : null
        ) : null}
      </div> */}
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
    <div className="flex divide-y flex-col">
      {modifiedData.map((data) => (
        <div
          key={data.money_id}
          className="z-2 flex gap-6 justify-between items-center flex-1 text-muted-foreground py-4 font-black"
        >
          <HybridTooltip>
            <HybridTooltipTrigger>
              <span className="truncate">{data?.snapshot.after?.name}</span>
            </HybridTooltipTrigger>
            <HybridTooltipContent align="start">
              <p>Money Name</p>
            </HybridTooltipContent>
          </HybridTooltip>
          <HybridTooltip>
            <HybridTooltipTrigger>
              <span className="font-normal">{data.reason}</span>
            </HybridTooltipTrigger>
            <HybridTooltipContent align="end">
              <p>Reason</p>
            </HybridTooltipContent>
          </HybridTooltip>
          <HybridTooltip>
            <HybridTooltipTrigger>
              <MonetaryValue
                amount={data.valueChanged}
                amountForSign={data.valueChanged > 0 ? 1 : -1}
                variant="sm"
                className={`${data.valueChanged > 0 && "text-green-500"} ${
                  data.valueChanged < 0 && "text-red-500"
                }`}
              />
            </HybridTooltipTrigger>
            <HybridTooltipContent align="end">
              <p>Value Changed</p>
            </HybridTooltipContent>
          </HybridTooltip>
        </div>
      ))}
    </div>
  );
}
