"use client";

import { observer } from "mobx-react-lite";
import { gameComputedStore } from "@/stores/GameComputedStore";

export const QuarterPayouts = observer(function QuarterPayouts() {
  const winners = gameComputedStore.quarterWinners;

  return (
    <div className="bg-white rounded-lg shadow p-4 text-sm">
      <h3 className="font-semibold mb-3">Payout Winners</h3>
      <div className="space-y-2">
        {winners.map(({ label, payout, winner }) => {
          const isFinal = label === "Final";

          return (
            <div
              key={label}
              className={`flex items-center py-2 border-b border-gray-100 last:border-0 ${
                isFinal ? "font-bold" : ""
              }`}
            >
              <span className={`w-12 ${isFinal ? "text-gray-900" : "text-gray-600"}`}>
                {label}
              </span>
              <span className="w-14 text-gray-500 text-xs">${payout}</span>
              {winner ? (
                <div className="flex-1 text-right">
                  <div className="text-gray-900">{winner.displayName}</div>
                  <div className="text-xs text-gray-500">{winner.score}</div>
                </div>
              ) : (
                <span className="flex-1 text-right text-gray-400">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
