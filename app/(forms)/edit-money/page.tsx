import { Suspense } from "react";
import Loader from "@/components/loader";
import { Metadata } from "next";
import EditMoneyComponent from "@/app/(forms)/edit-money/_component";

export const metadata: Metadata = {
  title: "Edit Money",
};

export default async function EditMoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ moneyId?: string }>;
}) {
  const targetMoneyId = (await searchParams).moneyId;

  return (
    <Suspense fallback={<Loader />}>
      <EditMoneyComponent targetMoneyId={targetMoneyId} />
    </Suspense>
  );
}
