"use client";

import { observer } from "mobx-react-lite";
import { Square as SquareType } from "@/types";
import { boardStore } from "@/stores/BoardStore";
import { authStore } from "@/stores/AuthStore";
import { useState } from "react";

interface SquareProps {
  square: SquareType;
  isWinning?: boolean;
  isHovered?: boolean;
}

export const Square = observer(function Square({ square, isWinning = false, isHovered = false }: SquareProps) {
  const [isClaiming, setIsClaiming] = useState(false);

  const isClaimed = !!square.claimedBy;
  const isClaimedByMe = square.claimedBy === authStore.username;

  const handleClick = async () => {
    if (isClaimed || isClaiming) return;

    setIsClaiming(true);
    const result = await boardStore.claimSquare(square.row, square.col);
    if (!result.success) {
      alert(result.error || "Failed to claim square");
    }
    setIsClaiming(false);
  };

  return (
    <div className={`relative w-full h-full ${isWinning || isHovered ? "z-10" : ""}`}>
      {isWinning && (
        <div className="absolute inset-[-3px] border-4 border-yellow-400 pointer-events-none" />
      )}
      {isHovered && !isWinning && (
        <div className="absolute inset-[-3px] border-4 border-blue-500 pointer-events-none" />
      )}
      <button
        onClick={handleClick}
        disabled={isClaimed || isClaiming}
        className={`
          aspect-square w-full h-full flex items-center justify-center text-[10px] font-medium
          transition-colors p-1 overflow-hidden border border-gray-300
          ${
            isClaimed
              ? isClaimedByMe
                ? "bg-blue-100 text-blue-900 cursor-default"
                : "bg-gray-100 text-gray-700 cursor-default"
              : "bg-white hover:bg-blue-50 cursor-pointer"
          }
          ${isClaiming ? "opacity-50" : ""}
        `}
        title={square.owner ? `${square.displayName} (Owner: ${square.owner})` : square.displayName || "Available"}
      >
        <span className="truncate leading-tight text-center">
          {isClaimed ? square.displayName : ""}
        </span>
      </button>
      {isClaimed && square.paid && (
        <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center pointer-events-none">
          <span className="text-[8px] font-bold text-white">P</span>
        </div>
      )}
    </div>
  );
});
