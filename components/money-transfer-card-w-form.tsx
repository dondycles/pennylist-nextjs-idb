import { BasicMoney } from "@/types/Money";

import Image from "next/image";
import { FINTECHS } from "@/lib/contants";

export default function MoneyTransferCardWForm({
  money,
  children,
}: {
  money: BasicMoney;
  children?: React.ReactNode;
}) {
  const fintechData = FINTECHS.find(
    (fintech) => fintech.value === money.fintech,
  );

  return (
    <div
      key={money.id}
      className="rounded-4xl bg-muted/75 dark:bg-muted/25 w-full p-6 relative overflow-hidden"
    >
      <div className="grid z-2 flex-1">{children}</div>
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
