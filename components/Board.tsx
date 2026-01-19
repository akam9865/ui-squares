"use client";

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { boardStore } from "@/stores/BoardStore";
import { scoreStore } from "@/stores/ScoreStore";
import { gameComputedStore } from "@/stores/GameComputedStore";
import { Square } from "./Square";

interface BoardProps {
  boardId: string;
  hoveredSquare?: { row: number; col: number } | null;
}

export const Board = observer(function Board({ boardId, hoveredSquare }: BoardProps) {
  useEffect(() => {
    boardStore.startPolling(boardId);
    return () => {
      boardStore.stopPolling();
    };
  }, [boardId]);

  if (boardStore.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading board...</p>
      </div>
    );
  }

  if (boardStore.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{boardStore.error}</p>
      </div>
    );
  }

  const displayRowNumbers = boardStore.numbersLocked
    ? boardStore.rowNumbers
    : Array(10).fill("?");
  const displayColNumbers = boardStore.numbersLocked
    ? boardStore.colNumbers
    : Array(10).fill("?");

  const homeTeamName = scoreStore.homeTeamName;
  const awayTeamName = scoreStore.awayTeamName;
  const winningBadges = gameComputedStore.winningBadges;
  const winningPosition = gameComputedStore.winningPosition;

  return (
    <div className="inline-block">
      <div className="mb-2 text-center ml-20">
        <span className="text-xl font-bold text-blue-600">{homeTeamName}</span>
      </div>

      <div className="flex">
        <div className="w-20" />
        {displayColNumbers.map((num, idx) => (
          <div
            key={idx}
            className="w-16 h-10 flex items-center justify-center font-bold text-blue-600 text-lg"
          >
            {num}
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="w-8 flex items-center justify-center">
          <span className="text-xl font-bold text-red-600 -rotate-90 whitespace-nowrap">{awayTeamName}</span>
        </div>
        <div className="flex flex-col">
          {displayRowNumbers.map((num, idx) => (
            <div
              key={idx}
              className="w-12 h-16 flex items-center justify-center font-bold text-red-600 text-lg"
            >
              {num}
            </div>
          ))}
        </div>

        <div>
          <div className="grid grid-cols-10 gap-0">
            {boardStore.squares.map((row, rowIdx) =>
              row.map((square, colIdx) => {
                const badges = winningBadges[`${rowIdx}-${colIdx}`] || [];
                return (
                  <div key={`${rowIdx}-${colIdx}`} className="w-16 h-16">
                    <Square
                      square={square}
                      isWinning={winningPosition?.row === rowIdx && winningPosition?.col === colIdx}
                      isHovered={hoveredSquare?.row === rowIdx && hoveredSquare?.col === colIdx}
                      winningBadges={badges}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
