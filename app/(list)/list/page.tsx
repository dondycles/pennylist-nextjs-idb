import { Metadata } from "next";
import ListPageComponent from "./list-component";

export const metadata: Metadata = {
  title: "List",
};

export default function ListPage() {
  return <ListPageComponent />;
}
