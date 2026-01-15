import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="animate-pulse flex gap-2 items-center text-base text-muted-foreground font-black h-fit">
      Loading... <Loader2 className="animate-spin" />
    </div>
  );
}
