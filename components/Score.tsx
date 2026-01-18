"use client";

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { scoreStore } from "@/stores/ScoreStore";

interface ScoreProps {
  team1?: string;
  team2?: string;
  pollInterval?: number;
}

export const Score = observer(function Score({
  team1 = "BUF",
  team2 = "DEN",
  pollInterval = 10000,
}: ScoreProps) {
  useEffect(() => {
    scoreStore.setTeams(team1, team2);
    scoreStore.startPolling(pollInterval);
    return () => {
      scoreStore.stopPolling();
    };
  }, [team1, team2, pollInterval]);

  if (scoreStore.isLoading) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-lg text-center">
        Loading scores...
      </div>
    );
  }

  if (scoreStore.error) {
    return (
      <div className="bg-red-900 text-white p-4 rounded-lg text-center">
        {scoreStore.error}
      </div>
    );
  }

  const game = scoreStore.gameScore;
  if (!game) return null;

  const getStatusText = () => {
    if (game.status === "pre") return "Pregame";
    if (game.status === "post") return "Final";
    if (game.quarter === 1) return `1st ${game.clock}`;
    if (game.quarter === 2) return `2nd ${game.clock}`;
    if (game.quarter === 3) return `3rd ${game.clock}`;
    if (game.quarter === 4) return `4th ${game.clock}`;
    return `OT ${game.clock}`;
  };

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg">
      <div className="text-center text-sm text-gray-400 mb-2">
        {getStatusText()}
      </div>
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold">{game.away.team}</div>
          <div className="text-4xl font-bold">{game.away.score}</div>
        </div>
        <div className="text-gray-500 text-xl">@</div>
        <div className="text-center">
          <div className="text-2xl font-bold">{game.home.team}</div>
          <div className="text-4xl font-bold">{game.home.score}</div>
        </div>
      </div>
    </div>
  );
});
