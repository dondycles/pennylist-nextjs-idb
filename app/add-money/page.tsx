"use client";

import AddMoneyForm from "@/components/add-money-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AddMoneyPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center pt-4 pb-32 mx-auto gap-6 max-w-lg">
      <div className="flex flex-wrap gap-4 justify-between w-full border-b p-4">
        <Button size="icon" variant="secondary" asChild>
          <Link href="/list">
            <ChevronLeft />
          </Link>
        </Button>
        <div className="text-right">
          <h1 className="text-foreground text-2xl font-black">Add Money</h1>
          <p className="text-muted-foreground font-semibold">
            Please fill the fields below.
          </p>
        </div>
      </div>
      <AddMoneyForm />
    </main>
  );
}
