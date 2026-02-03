import { History } from "@/types/History";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import MonetaryValue from "./monetary-value";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "./ui/hybrid-tooltip";
import Link from "next/link";

export default function HistoryTableInfo({
  data,
}: {
  data: History["transfer_history"];
}) {
  if (!data) return null;
  return (
    <Table className="[&>*>tr>*]:py-6 [&>*>tr>*]:first:pl-6 [&>*>tr>*]:last:pr-6 font-bold text-sm  [&>*>*>th]:font-bold [&>*>*>td]:font-bold">
      <TableHeader>
        <TableRow className="[&>th]:text-muted-foreground">
          <TableHead>Type</TableHead>
          <TableHead>Account</TableHead>
          <HybridTooltip>
            <HybridTooltipTrigger asChild>
              <TableHead className="text-right">Transfer</TableHead>
            </HybridTooltipTrigger>
            <HybridTooltipContent align="end">
              <p>Amount transferred to receivers</p>
            </HybridTooltipContent>
          </HybridTooltip>
          <HybridTooltip>
            <HybridTooltipTrigger asChild>
              <TableHead className="text-right">Fee</TableHead>
            </HybridTooltipTrigger>
            <HybridTooltipContent align="end">
              <p>Transfer fee</p>
            </HybridTooltipContent>
          </HybridTooltip>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="bg-orange-500/10 ">
          <TableCell className="text-orange-500">Sender</TableCell>
          <TableCell>
            <Link href={`/money/${data.senderMoney.id}`}>
              {data.senderMoney.name}
            </Link>
          </TableCell>

          <TableCell className="text-right text-orange-500">
            <MonetaryValue
              amountForSign={-1}
              amount={Number(data.senderMoney.demands)}
              variant="allBase"
            />
          </TableCell>

          <TableCell className="text-right text-muted-foreground">
            <MonetaryValue amountForSign={0} amount={0} variant="allBase" />
          </TableCell>
        </TableRow>

        {data.receiverMoneys.map((receiver) => (
          <TableRow key={receiver.id} className="bg-green-500/10">
            <TableCell className="text-green-600">Receiver</TableCell>
            <TableCell>
              <Link href={`/money/${receiver.id}`}>{receiver.name}</Link>
            </TableCell>

            <TableCell className="text-right text-green-600">
              <MonetaryValue
                amountForSign={1}
                amount={Number(receiver.demand)}
                variant="allBase"
              />
            </TableCell>

            <TableCell className="text-right">
              <MonetaryValue
                amountForSign={0}
                amount={Number(receiver.fee)}
                variant="allBase"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="text-muted-foreground">
            Total
          </TableCell>
          <TableCell className="text-right text-red-500">
            <MonetaryValue
              amountForSign={-1}
              amount={data.receiverMoneys.reduce(
                (sum, r) => sum + Number(r.fee),
                0,
              )}
              variant="allBase"
            />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
