import { Metadata } from "next";
import HistoryPageComponent from "@/components/history-component";
export const metadata: Metadata = {
  title: "History",
};
export default function HistoryPage() {
  return <HistoryPageComponent />;
}
