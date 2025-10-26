"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer"; 
import { ITopUpRequest } from "@/models/TopUpRequest";
import { getTopUpHistory } from "@/lib/actions/history";
import { Loader2, CheckCircle } from "lucide-react";
import HistoryItem from "./HistoryItem";


export default function TransactionHistoryList({
  initialHistory,
}: {
  initialHistory: ITopUpRequest[];
}) {
  const [history, setHistory] = useState(initialHistory);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialHistory.length > 0);
  const [isLoading, setIsLoading] = useState(false); 

  const { ref, inView } = useInView();

  const loadMoreHistory = async () => {
    setIsLoading(true); 
    const nextHistory = await getTopUpHistory({ page });

    if (nextHistory && nextHistory.length > 0) {
      setPage((prev) => prev + 1);
      setHistory((prev) => [...prev, ...nextHistory]);
    } else {
      setHasMore(false);
    }
    setIsLoading(false); 
  };

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreHistory();
    }
  }, [inView, hasMore, isLoading]);

  if (history.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        Bạn chưa có giao dịch nào.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((req) => (
        <HistoryItem key={req._id} req={req} />
      ))}

      <div ref={ref} className="flex justify-center items-center p-4 h-10">
        {isLoading && (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        )}
        {!isLoading && !hasMore && history.length > 0 && (
          <div className="flex items-center text-muted-foreground text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Bạn đã xem hết lịch sử</span>
          </div>
        )}
      </div>
    </div>
  );
}
