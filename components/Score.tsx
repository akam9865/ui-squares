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

export const Score = observer(({
  gameId,
  team1,
  team2,
  sport = "nfl",
  pollInterval = 10000,
}: ScoreProps) => {
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

  const otPeriods = scoreStore.otPeriods;
  const isFinal = scoreStore.isGameOver;

  return (
    <div className="bg-white rounded-lg shadow p-4 text-sm">
      <table className="w-full text-center">
        <thead>
          <tr className="text-xs text-gray-500">
            <th className="text-left py-1 font-medium">Team</th>
            <th className="py-1 w-8 font-medium">1</th>
            <th className="py-1 w-8 font-medium">2</th>
            <th className="py-1 w-8 font-medium">3</th>
            <th className="py-1 w-8 font-medium">4</th>
            {Array.from({ length: otPeriods }, (_, i) => (
              <th key={`ot-${i}`} className="py-1 w-8 font-medium">
                {otPeriods === 1 ? "OT" : `O${i + 1}`}
              </th>
            ))}
            <th className="py-1 w-10 font-medium">T</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          <tr>
            <td className="text-left py-1 font-medium">{game.away.team}</td>
            <td className="py-1">{game.away.linescores[0] ?? "-"}</td>
            <td className="py-1">{game.away.linescores[1] ?? "-"}</td>
            <td className="py-1">{game.away.linescores[2] ?? "-"}</td>
            <td className="py-1">{game.away.linescores[3] ?? "-"}</td>
            {Array.from({ length: otPeriods }, (_, i) => (
              <td key={`away-ot-${i}`} className="py-1">
                {game.away.linescores[4 + i] ?? "-"}
              </td>
            ))}
            <td className={`py-1 ${isFinal ? "font-bold" : ""}`}>{game.away.score}</td>
          </tr>
          <tr>
            <td className="text-left py-1 font-medium">{game.home.team}</td>
            <td className="py-1">{game.home.linescores[0] ?? "-"}</td>
            <td className="py-1">{game.home.linescores[1] ?? "-"}</td>
            <td className="py-1">{game.home.linescores[2] ?? "-"}</td>
            <td className="py-1">{game.home.linescores[3] ?? "-"}</td>
            {Array.from({ length: otPeriods }, (_, i) => (
              <td key={`home-ot-${i}`} className="py-1">
                {game.home.linescores[4 + i] ?? "-"}
              </td>
            ))}
            <td className={`py-1 ${isFinal ? "font-bold" : ""}`}>{game.home.score}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});
