import { Metadata } from "next";
import ListPageComponent from "@/app/(list)/list/component";

export const metadata: Metadata = {
  title: "List",
};

export default function ListPage() {
  return <ListPageComponent />;
}
