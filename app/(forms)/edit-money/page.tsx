import { Info } from "lucide-react";
import EditMoneyComponent from "./_component";
import { Suspense } from "react";

export default async function EditMoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ moneyId?: string }>;
}) {
  const targetMoneyId = (await searchParams).moneyId;
  if (!targetMoneyId)
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center pt-4 pb-32 px-4 mx-auto gap-6 max-w-lg">
        <Info className="size-16" />
        <h1 className="text-foreground text-2xl font-black">No Money ID</h1>
      </main>
    );

  return (
    <Suspense>
      <EditMoneyComponent targetMoneyId={targetMoneyId} />
    </Suspense>
  );
}
