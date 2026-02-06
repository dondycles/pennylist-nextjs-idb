import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Drawer as DrawerPrimitive } from "vaul";
export default function BottomDrawer({
  trigger,
  content,
  title,
  desc,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  trigger: React.ReactNode;
  content: () => React.ReactElement;
  title: string;
  desc: string;
}) {
  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled values if provided, otherwise use internal state
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} {...props}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="pb-4 max-h-[90dvh] overflow-y-auto overflow-x-hidden">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{desc}</DrawerDescription>
          </DrawerHeader>
          {content()}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
