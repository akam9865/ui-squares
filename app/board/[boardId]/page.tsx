"use client";

import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "next/navigation";
import { boardStore } from "@/stores/BoardStore";
import { Board } from "@/components/Board";
import { AdminPanel } from "@/components/AdminPanel";
import { Score } from "@/components/Score";
import { MySquares } from "@/components/MySquares";
import { QuarterPayouts } from "@/components/QuarterPayouts";
import { FutureWinners } from "@/components/FutureWinners";

const BoardPage = observer(() => {
  const params = useParams<{ boardId: string }>();
  const boardId = params.boardId;
  const [hoveredSquare, setHoveredSquare] = useState<{
    row: number;
    col: number;
  } | null>(null);

  return (
    <>
      <AdminPanel />

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
