import MoneyForm from "@/components/money-form";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Add Money",
};
export default function AddMoneyPage() {
  return <MoneyForm action="add" />;
}
