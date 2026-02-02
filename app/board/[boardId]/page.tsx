"use client";

import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useParams, useSearchParams } from "next/navigation";
import { boardStore } from "@/stores/BoardStore";
import { authStore } from "@/stores/AuthStore";
import { Board } from "@/components/Board";
import { AdminPanel } from "@/components/AdminPanel";
import { Score } from "@/components/Score";
import { MySquares } from "@/components/MySquares";
import { QuarterPayouts } from "@/components/QuarterPayouts";
import { FutureWinners } from "@/components/FutureWinners";
import { DisplayNamePrompt } from "@/components/DisplayNamePrompt";

const BoardPage = observer(() => {
  const params = useParams<{ boardId: string }>();
  const searchParams = useSearchParams();
  const boardId = params.boardId;
  const shareToken = searchParams.get("share");

  const [hoveredSquare, setHoveredSquare] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [showDisplayNamePrompt, setShowDisplayNamePrompt] = useState(false);
  const [shareSessionChecked, setShareSessionChecked] = useState(false);

  // Set share token on store for API requests
  useEffect(() => {
    boardStore.setShareToken(shareToken);
  }, [shareToken]);

  // Check for existing share session when share token is present
  useEffect(() => {
    if (shareToken && !authStore.isAuthenticated && !shareSessionChecked) {
      authStore.checkShareSession(boardId).then((hasSession) => {
        if (!hasSession) {
          setShowDisplayNamePrompt(true);
        }
        setShareSessionChecked(true);
      });
    }
  }, [shareToken, boardId, shareSessionChecked]);

  const handleShareSessionSuccess = () => {
    setShowDisplayNamePrompt(false);
    // Trigger board fetch after setting share session
    boardStore.fetchBoard();
  };

  return (
    <>
      <AdminPanel />

      {showDisplayNamePrompt && shareToken && (
        <DisplayNamePrompt
          boardId={boardId}
          shareToken={shareToken}
          onSuccess={handleShareSessionSuccess}
        />
      )}

      <div className="flex justify-center gap-6 mt-20">
        <div className="flex flex-col gap-4 w-64">
          {boardStore.gameId && (
            <Score
              gameId={boardStore.gameId}
              sport={boardStore.sport}
              pollInterval={10000}
            />
          )}
          <MySquares onSquareHover={setHoveredSquare} />
        </div>
        <Board boardId={boardId} hoveredSquare={hoveredSquare} />
        <div className="flex flex-col gap-4 w-64">
          {boardStore.gameId && (
            <>
              <QuarterPayouts />
              <FutureWinners />
            </>
          )}
        </div>
      </div>
    </>
  );
});

export default BoardPage;
