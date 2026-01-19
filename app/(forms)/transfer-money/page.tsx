export const revalidate = 0;
import { Suspense } from "react";
import Loader from "@/components/loader";
import { Metadata } from "next";
import TransferMoneyComponent from "@/components/transfer-money-component";

export const metadata: Metadata = {
  title: "Transfer Money",
};

export default async function TransferMoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ senderMoneyId?: string }>;
}) {
  const senderMoneyId = (await searchParams).senderMoneyId;

  return (
    <Suspense key={senderMoneyId} fallback={<Loader />}>
      <TransferMoneyComponent senderMoneyId={senderMoneyId} />
    </Suspense>
  );
}
