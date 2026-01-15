import EditMoneyComponent from "./_component";
import { Suspense } from "react";
import Loader from "@/components/loader";

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
