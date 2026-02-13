import TransferMoneyForm from "@/components/transfer-money-form";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Transfer Money",
};
export default async function TransferMoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ moneyId?: string }>;
}) {
  const moneyId = (await searchParams).moneyId;
  return <TransferMoneyForm moneyId={moneyId} />;
}
