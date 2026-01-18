"use client";

import { observer } from "mobx-react-lite";
import { Square as SquareType } from "@/types";
import { boardStore } from "@/stores/BoardStore";
import { authStore } from "@/stores/AuthStore";
import { useState } from "react";

interface SquareProps {
  square: SquareType;
}

export const Square = observer(function Square({ square }: SquareProps) {
  const [isClaiming, setIsClaiming] = useState(false);

  const isOwned = !!square.owner;
  const isOwnedByMe = square.owner === authStore.username;

  const handleClick = async () => {
    if (isOwned || isClaiming) return;

    setIsClaiming(true);
    const result = await boardStore.claimSquare(square.row, square.col);
    if (!result.success) {
      alert(result.error || "Failed to claim square");
    }
    setIsClaiming(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isOwned || isClaiming}
      className={`
        aspect-square w-full flex items-center justify-center text-xs font-medium
        border border-gray-300 transition-colors
        ${
          isOwned
            ? isOwnedByMe
              ? "bg-green-200 text-green-800 cursor-default"
              : "bg-gray-200 text-gray-600 cursor-default"
            : "bg-white hover:bg-blue-100 cursor-pointer"
        }
        ${isClaiming ? "opacity-50" : ""}
      `}
      title={square.owner || "Available"}
    >
      {isOwned ? getInitials(square.owner!) : ""}
    </button>
  );
});
