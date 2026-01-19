"use client";

import { observer } from "mobx-react-lite";
import { boardStore } from "@/stores/BoardStore";
import { scoreStore } from "@/stores/ScoreStore";
import { gameComputedStore } from "@/stores/GameComputedStore";
import { WinningBadge } from "./WinningBadge";

interface MySquaresProps {
  onSquareHover?: (square: { row: number; col: number } | null) => void;
}

export const MySquares = observer(({ onSquareHover }: MySquaresProps) => {
  const mySquares = gameComputedStore.mySquares;
  const mySquaresWithBadges = gameComputedStore.mySquaresWithBadges;
  const { amountOwed } = gameComputedStore.mySquaresPaymentInfo;
  const homeTeam = scoreStore.homeTeamAbbr;
  const awayTeam = scoreStore.awayTeamAbbr;

  return (
    <div className="bg-white rounded-lg shadow p-4 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">My Squares</h3>
        <div className="text-right">
          <span className="text-gray-600">{mySquares.length} squares</span>
          {mySquares.length > 0 && (
            <span className="ml-2">
              {amountOwed > 0 ? (
                <span className="text-red-600 font-medium">${amountOwed} owed</span>
              ) : (
                <span className="text-green-600 font-medium">Paid</span>
              )}
            </span>
          )}
        </div>
      </div>
      {mySquares.length === 0 ? (
        <p className="text-gray-500">No squares claimed yet.</p>
      ) : !boardStore.numbersLocked ? (
        <p className="text-gray-500">Numbers not yet picked.</p>
      ) : (
        <div className="space-y-1 overflow-y-auto max-h-[480px]">
          {mySquaresWithBadges.map(({ square, homeNum, awayNum, badges, isCurrentWinner }) => {
            return (
              <div
                key={`${square.row}-${square.col}`}
                className={`py-1.5 px-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded transition-colors ${
                  isCurrentWinner ? "bg-yellow-50 border-yellow-200" : "text-gray-700"
                }`}
                onMouseEnter={() =>
                  onSquareHover?.({ row: square.row, col: square.col })
                }
                onMouseLeave={() => onSquareHover?.(null)}
              >
                <div className="flex items-center justify-between">
                  <span>
                    {homeTeam} {homeNum}, {awayTeam} {awayNum}
                  </span>
                  {badges.length > 0 && (
                    <div className="flex gap-1 ml-2">
                      {badges.map((badge) => (
                        <WinningBadge key={badge} quarter={badge} size="md" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
