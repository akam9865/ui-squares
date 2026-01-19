"use client";

import { observer } from "mobx-react-lite";
import { boardStore } from "@/stores/BoardStore";
import { authStore } from "@/stores/AuthStore";
import { Square } from "@/types";

interface UserStatsProps {
  homeTeam?: string;
  awayTeam?: string;
  onSquareHover?: (square: { row: number; col: number } | null) => void;
}

export const UserStats = observer(function UserStats({ homeTeam = "HOME", awayTeam = "AWAY", onSquareHover }: UserStatsProps) {
  const username = authStore.username;

  // Get all squares belonging to the current user
  const mySquares: Square[] = [];

  for (const row of boardStore.squares) {
    for (const square of row) {
      if (square.claimedBy === username) {
        mySquares.push(square);
      }
    }
  }

  const getSquareNumbers = (square: Square) => {
    if (!boardStore.numbersLocked) {
      return { row: "?", col: "?" };
    }
    return {
      row: boardStore.rowNumbers[square.row],
      col: boardStore.colNumbers[square.col],
    };
  };

  if (mySquares.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-sm">
        <h3 className="font-semibold mb-2">Your Squares</h3>
        <p className="text-gray-500">You haven't claimed any squares yet.</p>
      </div>
    );
  }

  const paidCount = mySquares.filter(s => s.paid).length;
  const unpaidCount = mySquares.length - paidCount;
  const amountOwed = unpaidCount * boardStore.pricePerSquare;

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 text-sm">
        <h3 className="font-semibold mb-2">Your Squares</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{mySquares.length} squares</span>
          {amountOwed > 0 ? (
            <span className="text-red-600 font-medium">${amountOwed} owed</span>
          ) : (
            <span className="text-green-600 font-medium">Paid in full</span>
          )}
        </div>
        {unpaidCount > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {paidCount} paid, {unpaidCount} unpaid @ ${boardStore.pricePerSquare}/sq
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 text-sm flex-1 flex flex-col min-h-0">
        <h3 className="font-semibold mb-2">Square List</h3>
        <div className="space-y-1 overflow-y-auto flex-1">
          {mySquares.map((square) => {
            const nums = getSquareNumbers(square);
            return (
              <div
                key={`${square.row}-${square.col}`}
                className="py-1 border-b border-gray-100 last:border-0 text-gray-700 cursor-pointer hover:bg-gray-50"
                onMouseEnter={() => onSquareHover?.({ row: square.row, col: square.col })}
                onMouseLeave={() => onSquareHover?.(null)}
              >
                {homeTeam} {nums.col}, {awayTeam} {nums.row}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});
