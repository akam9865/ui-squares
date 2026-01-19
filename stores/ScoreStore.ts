import { makeAutoObservable, runInAction } from "mobx";
import { fetchScoreboard, findGame, getGameInfo, fetchGameById, ESPNEvent } from "@/lib/espn";
import { Sport } from "@/types";

export interface GameScore {
  home: { team: string; displayName: string; score: number };
  away: { team: string; displayName: string; score: number };
  quarter: number;
  clock: string;
  status: "pre" | "in" | "post";
}

class ScoreStore {
  gameScore: GameScore | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  team1: string | null = null;
  team2: string | null = null;
  gameId: string | null = null;
  sport: Sport = "nfl";

  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setTeams(team1: string, team2: string, sport: Sport = "nfl") {
    this.team1 = team1;
    this.team2 = team2;
    this.gameId = null;
    this.sport = sport;
    this.fetchScore();
  }

  setGameId(gameId: string, sport: Sport = "nfl") {
    this.gameId = gameId;
    this.team1 = null;
    this.team2 = null;
    this.sport = sport;
    this.fetchScore();
  }

  async fetchScore() {
    try {
      let game: ESPNEvent | null = null;

      if (this.gameId) {
        game = await fetchGameById(this.gameId, this.sport);
      } else if (this.team1 && this.team2) {
        const scoreboard = await fetchScoreboard(this.sport);
        game = findGame(scoreboard, this.team1, this.team2);
      }

      runInAction(() => {
        if (game) {
          const gameInfo = getGameInfo(game);
          this.gameScore = {
            home: {
              team: gameInfo.homeTeam.abbreviation,
              displayName: gameInfo.homeTeam.displayName,
              score: gameInfo.homeTeam.score
            },
            away: {
              team: gameInfo.awayTeam.abbreviation,
              displayName: gameInfo.awayTeam.displayName,
              score: gameInfo.awayTeam.score
            },
            quarter: gameInfo.period,
            clock: gameInfo.clock,
            status: gameInfo.status,
          };
          this.error = null;
        } else {
          this.gameScore = null;
          if (this.gameId) {
            this.error = `No game found for ID: ${this.gameId}`;
          } else {
            this.error = `No game found for ${this.team1} vs ${this.team2}`;
          }
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Failed to fetch score";
        this.isLoading = false;
      });
    }
  }

  startPolling(intervalMs: number = 10000) {
    if (this.pollingInterval) return;

    this.fetchScore();
    this.pollingInterval = setInterval(() => {
      this.fetchScore();
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

export const scoreStore = new ScoreStore();
