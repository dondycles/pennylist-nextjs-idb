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
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  trigger: React.ReactNode;
  content: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Drawer {...props}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="pb-4 max-h-[90dvh] overflow-y-auto overflow-x-hidden">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{desc}</DrawerDescription>
          </DrawerHeader>
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
