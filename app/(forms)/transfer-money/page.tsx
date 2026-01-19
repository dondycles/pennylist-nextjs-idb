import TransferMoneyForm from "@/components/transfer-money-form";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Transfer Money",
};
export default function TransferMoneyPage() {
  return <TransferMoneyForm />;
}
