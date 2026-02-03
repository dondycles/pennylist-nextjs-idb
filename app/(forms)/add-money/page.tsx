import AddMoneyForm from "@/components/add-money-form";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Add Money",
};
export default function AddMoneyPage() {
  return <AddMoneyForm />;
}
