"use client";

import { observer } from "mobx-react-lite";
import { gameComputedStore } from "@/stores/GameComputedStore";
import { scoreStore } from "@/stores/ScoreStore";

export const FutureWinners = observer(function FutureWinners() {
  const scenarios = gameComputedStore.scoreChangeScenarios;
  const homeTeam = scoreStore.homeTeamAbbr;
  const awayTeam = scoreStore.awayTeamAbbr;

  if (scenarios.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 text-sm">
      <h3 className="font-semibold mb-4">Winner If...</h3>
      <div className="space-y-2 overflow-y-auto max-h-[400px]">
        {scenarios.map((scenario, idx) => (
          <div
            key={idx}
            className={`p-2 rounded border ${
              scenario.isMine
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-xs">{scenario.label}</span>
              <span className="text-xs text-gray-600">
                {homeTeam} {scenario.homeNum}, {awayTeam} {scenario.awayNum}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {scenario.homeScore}-{scenario.awayScore}
              </span>
              <span
                className={`font-medium ${
                  scenario.isMine
                    ? "text-blue-700"
                    : scenario.displayName
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {scenario.displayName || "Unclaimed"}
                {scenario.isMine && " ⭐"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
