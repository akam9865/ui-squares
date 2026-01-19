"use client";

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { scoreStore } from "@/stores/ScoreStore";
import { Sport } from "@/types";

interface ScoreProps {
  gameId?: string | null;
  team1?: string;
  team2?: string;
  sport?: Sport;
  pollInterval?: number;
}

export const Score = observer(function Score({
  gameId,
  team1,
  team2,
  sport = "nfl",
  pollInterval = 10000,
}: ScoreProps) {
  useEffect(() => {
    if (gameId) {
      scoreStore.setGameId(gameId, sport);
    } else if (team1 && team2) {
      scoreStore.setTeams(team1, team2, sport);
    }
    scoreStore.startPolling(pollInterval);
    return () => {
      scoreStore.stopPolling();
    };
  }, [gameId, team1, team2, sport, pollInterval]);

  if (scoreStore.isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center text-sm text-gray-500">
        Loading scores...
      </div>
    );
  }

  if (scoreStore.error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center text-sm text-red-500">
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
    <div className="bg-white rounded-lg shadow p-4 text-sm">
      <div className="text-center text-xs text-gray-500 mb-2">
        {getStatusText()}
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="text-xs text-gray-600">{game.away.displayName}</div>
          <div className="text-2xl font-bold text-gray-900">{game.away.score}</div>
        </div>
        <div className="text-gray-400 text-sm">@</div>
        <div className="text-center">
          <div className="text-xs text-gray-600">{game.home.displayName}</div>
          <div className="text-2xl font-bold text-gray-900">{game.home.score}</div>
        </div>
      </div>
    </div>
  );
});
