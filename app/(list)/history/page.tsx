"use client";

import HistoryCard from "@/components/history-card";
import { useHistoryStore } from "@/store/History";

export default function HistoryPage() {
  const { histories } = useHistoryStore();
  const historyByDate = histories.sort(
    (a, b) =>
      new Date(b.date_added).getTime() - new Date(a.date_added).getTime()
  );
  return historyByDate.map((h) => <HistoryCard key={h.id} history={h} />);
}
