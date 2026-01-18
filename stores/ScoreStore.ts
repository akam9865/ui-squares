import { makeAutoObservable, runInAction } from "mobx";
import { fetchNFLScores, findGame, getGameScores } from "@/lib/espn";

export interface GameScore {
  home: { team: string; score: number };
  away: { team: string; score: number };
  quarter: number;
  clock: string;
  status: "pre" | "in" | "post";
}

class ScoreStore {
  gameScore: GameScore | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  team1: string = "BUF";
  team2: string = "DEN";

  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setTeams(team1: string, team2: string) {
    this.team1 = team1;
    this.team2 = team2;
    this.fetchScore();
  }

  async fetchScore() {
    try {
      const scoreboard = await fetchNFLScores();
      const game = findGame(scoreboard, this.team1, this.team2);

      runInAction(() => {
        if (game) {
          this.gameScore = getGameScores(game);
          this.error = null;
        } else {
          this.gameScore = null;
          this.error = `No game found for ${this.team1} vs ${this.team2}`;
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
