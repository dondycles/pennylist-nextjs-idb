import { FINTECHS } from "@/lib/contants";
import { amountFormat } from "@/lib/utils";
import { History } from "@/types/History";
import Image from "next/image";
import CurrencySign from "./currency-sign";

export default function HistoryCard({ history }: { history: History }) {
  const fintechData = FINTECHS.find(
    (fintech) => fintech.value === history.snapshot.after.money?.fintech
  );

  const valueChanged =
    Number(history.snapshot.after.money?.amount ?? 0) -
    Number(history.snapshot.before.money?.amount ?? 0);

  return (
    <div className="rounded-4xl flex  flex-col bg-muted/75 dark:bg-muted/25 w-full p-6 justify-between relative overflow-hidden">
      <div className="z-2 flex gap-6 justify-between items-start flex-1 text-xs font-normal text-muted-foreground border-b pb-4">
        <span className="capitalize truncate">{history.type}</span>
        <span>{new Date(history.date_added).toLocaleString()}</span>
      </div>
      <div className="z-2 flex gap-6 justify-between items-center flex-1 text-muted-foreground py-4 font-black">
        <div className="grid space-y-1.5">
          <span className="truncate">{history.snapshot.after.money?.name}</span>
          {history.reason ? (
            <p className="font-normal">{history.reason}</p>
          ) : null}
        </div>
        <p
          className={`text-4xl ${valueChanged > 0 && "text-green-500"} ${
            valueChanged < 0 && "text-red-500"
          }`}
        >
          <CurrencySign amountForSign={valueChanged} />
          <span>{amountFormat(valueChanged)}</span>
        </p>
      </div>
      <div className="z-2 flex gap-6 justify-between items-start flex-1 text-xs font-normal text-muted-foreground border-t pt-4">
        <span className="truncate">Total Money After Transaction:</span>
        <p className="capitalize">
          <CurrencySign className="text-xs font-normal text-muted-foreground" />{" "}
          <span>{amountFormat(history.snapshot.after.total_money)}</span>
        </p>
      </div>
      <div className="absolute top-0 left-1/2 w-full h-full z-0  opacity-10 pointer-events-none">
        {fintechData ? (
          fintechData.bg ? (
            <Image
              alt={`${fintechData.label}-${history.snapshot.after.money?.name}`}
              src={fintechData.bg}
              className="w-auto h-[125%] object-cover object-left"
            />
          ) : null
        ) : null}
      </div>
    </div>
  );
}
