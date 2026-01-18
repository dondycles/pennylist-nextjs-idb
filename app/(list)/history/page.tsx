import { Metadata } from "next";
import HistoryPageComponent from "@/app/(list)/history/_component";
export const metadata: Metadata = {
  title: "History",
};
export default function HistoryPage() {
  return <HistoryPageComponent />;
}
