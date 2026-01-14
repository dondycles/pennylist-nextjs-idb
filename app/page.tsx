import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Simple and basic",
      desc: "A streamlined interface designed for speed and ease of use, without unnecessary clutter.",
    },
    {
      title: "No account needed",
      desc: "Start using the app instantly. We don’t require any personal information or sign-ups.",
    },
    {
      title: "Data is only saved locally",
      desc: "Your privacy is a priority. All information stays on your device and never touches a server.",
    },
  ];
  return (
    <main className="flex min-h-dvh w-full max-w-3xl flex-col items-center justify-between py-32 px-4 mx-auto gap-8">
      <div className="flex flex-col items-center gap-8">
        <Image
          className="dark:invert-0 invert"
          src="/pennylist-cutout.webp"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center ">
          <h1 className="text-3xl sm:text-5xl font-black sm:leading-12">
            The simplest list for every pennies you own - pennylist.
          </h1>
          <p className="max-w-md text-muted-foreground">
            Looking for a basic tool to keep track of your wealth? Give
            pennylist a try!
          </p>
        </div>
        <Button asChild>
          <Link href="/list">
            Start Listing <Pencil />
          </Link>
        </Button>
        <ul className="flex flex-col gap-2 max-w-sm">
          {features.map((f) => (
            <li key={f.title}>
              <div className="bg-muted rounded-4xl p-6 space-y-2">
                <h2 className="font-black text-2xl">{f.title}</h2>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
