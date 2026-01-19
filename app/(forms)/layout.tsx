"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FormsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <main className="flex min-h-dvh w-full flex-col items-center py-4 mx-auto gap-4 max-w-lg">
      <div className="flex flex-wrap gap-4 justify-between w-full border-b px-4 pb-4 items-center">
        <Button size="icon" variant="secondary" asChild>
          <Link href="/list">
            <ChevronLeft />
          </Link>
        </Button>
        <div className="text-right">
          <h1 className="text-foreground text-2xl font-black">
            {pathname === "/add-money" ? "Add" : null}
            {pathname === "/edit-money" ? "Edit" : null}
            {pathname.startsWith("/transfer-money") ? "Transfer" : null} Money
          </h1>
          <p className="text-muted-foreground font-semibold">
            Please fill the fields below.
          </p>
        </div>
      </div>
      {children}
    </main>
  );
}
