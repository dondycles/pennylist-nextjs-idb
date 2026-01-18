import { Metadata } from "next";
import ListPageComponent from "./_component";

export const metadata: Metadata = {
  title: "List",
};

export default function ListPage() {
  return <ListPageComponent />;
}
