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

      <div className="mt-16 lg:mt-20 px-4 lg:px-0">
        {/* Mobile: Score at top */}
        <div className="lg:hidden mb-4">
          {boardStore.gameId && (
            <Score
              gameId={boardStore.gameId}
              sport={boardStore.sport}
              pollInterval={10000}
            />
          )}
        </div>

        {/* Desktop: 3-column layout, Mobile: stacked */}
        <div className="flex flex-col lg:flex-row justify-center gap-4 lg:gap-6">
          {/* Left sidebar - hidden on mobile */}
          <div className="hidden lg:flex flex-col gap-4 w-64">
            {boardStore.gameId && (
              <Score
                gameId={boardStore.gameId}
                sport={boardStore.sport}
                pollInterval={10000}
              />
            )}
            <MySquares onSquareHover={setHoveredSquare} />
          </div>

          {/* Board - horizontally scrollable on mobile */}
          <div className="overflow-x-auto lg:overflow-visible">
            <div className="inline-block min-w-max">
              <Board boardId={boardId} hoveredSquare={hoveredSquare} />
            </div>
          </div>

          {/* Right sidebar - hidden on mobile */}
          <div className="hidden lg:flex flex-col gap-4 w-64">
            {boardStore.gameId && (
              <>
                <QuarterPayouts />
                <FutureWinners />
              </>
            )}
          </div>
        </div>

        {/* Mobile: panels below board */}
        <div className="lg:hidden mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MySquares onSquareHover={setHoveredSquare} />
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
