"use client";

import { useEffect, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "next/navigation";
import { authStore } from "@/stores/AuthStore";
import { boardStore } from "@/stores/BoardStore";
import { Square } from "@/types";
import { SquareManagement } from "@/components/SquareManagement";
import { BoardSummary } from "@/components/BoardSummary";
import { ShareLinkGenerator } from "@/components/ShareLinkGenerator";
import { getClaimedSquaresAction } from "../actions";

const AdminPage = observer(() => {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const [squares, setSquares] = useState<Square[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSquares = useCallback(async () => {
    try {
      const claimed = await getClaimedSquaresAction(boardId);
      setSquares(claimed);
    } catch (err) {
      console.error("Failed to fetch squares:", err);
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (authStore.isAdmin) {
      boardStore.startPolling(boardId);
      fetchSquares();
    }
    return () => {
      boardStore.stopPolling();
    };
  }, [authStore.isAdmin, boardId, fetchSquares]);

  const handleUpdate = useCallback(() => {
    fetchSquares();
    boardStore.fetchBoard();
  }, [fetchSquares]);

  if (isLoading || boardStore.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <BoardSummary />
      </div>

      <div className="mb-6">
        <ShareLinkGenerator boardId={boardId} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Square Management</h2>
        <SquareManagement boardId={boardId} squares={squares} onUpdate={handleUpdate} />
      </div>
    </>
  );
});

export default AdminPage;
