import { makeAutoObservable, runInAction } from "mobx";
import { fetchScoreboard, findGame, getGameInfo, fetchGameById, ESPNEvent } from "@/lib/espn";
import { Sport } from "@/types";

export interface GameScore {
  home: { team: string; displayName: string; score: number; linescores: number[] };
  away: { team: string; displayName: string; score: number; linescores: number[] };
  quarter: number;
  clock: string;
  status: "pre" | "in" | "post";
}

export interface CumulativeScore {
  quarter: number;
  homeScore: number;
  awayScore: number;
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

  // Computed getters
  get homeTeamName(): string {
    return this.gameScore?.home.displayName || "HOME";
  }

  get awayTeamName(): string {
    return this.gameScore?.away.displayName || "AWAY";
  }

  get homeTeamAbbr(): string {
    return this.gameScore?.home.team || "HOME";
  }

  get awayTeamAbbr(): string {
    return this.gameScore?.away.team || "AWAY";
  }

  get isGameOver(): boolean {
    return this.gameScore?.status === "post";
  }

  get finalScore(): { home: number; away: number } | null {
    if (!this.gameScore) return null;
    return {
      home: this.gameScore.home.score,
      away: this.gameScore.away.score,
    };
  }

  get cumulativeScores(): CumulativeScore[] {
    if (!this.gameScore) return [];

    const homeLinescores = this.gameScore.home.linescores;
    const awayLinescores = this.gameScore.away.linescores;
    const scores: CumulativeScore[] = [];

    let homeCumulative = 0;
    let awayCumulative = 0;

    const maxQuarters = Math.min(homeLinescores.length, awayLinescores.length);
    for (let i = 0; i < maxQuarters; i++) {
      homeCumulative += homeLinescores[i] || 0;
      awayCumulative += awayLinescores[i] || 0;
      scores.push({
        quarter: i + 1,
        homeScore: homeCumulative,
        awayScore: awayCumulative,
      });
    }

    return scores;
  }

  get totalPeriods(): number {
    if (!this.gameScore) return 4;
    return Math.max(
      this.gameScore.home.linescores.length,
      this.gameScore.away.linescores.length,
      4
    );
  }

  get otPeriods(): number {
    return this.totalPeriods > 4 ? this.totalPeriods - 4 : 0;
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
              score: gameInfo.homeTeam.score,
              linescores: gameInfo.homeTeam.linescores,
            },
            away: {
              team: gameInfo.awayTeam.abbreviation,
              displayName: gameInfo.awayTeam.displayName,
              score: gameInfo.awayTeam.score,
              linescores: gameInfo.awayTeam.linescores,
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
