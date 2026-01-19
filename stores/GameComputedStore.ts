import { makeAutoObservable } from "mobx";
import { boardStore } from "./BoardStore";
import { scoreStore } from "./ScoreStore";
import { authStore } from "./AuthStore";
import { Square } from "@/types";

export interface QuarterWinner {
  label: string;
  payout: number;
  winner: {
    displayName: string;
    score: string;
  } | null;
}

export interface SquarePaymentInfo {
  paidCount: number;
  unpaidCount: number;
  amountOwed: number;
}

export interface MySquareWithBadges {
  square: Square;
  homeNum: number | string;
  awayNum: number | string;
  badges: string[];
  isCurrentWinner: boolean;
}

export interface ScoreChangeScenario {
  label: string;
  homeScore: number;
  awayScore: number;
  owner: string | null;
  displayName: string | null;
  homeNum: number;
  awayNum: number;
  isMine: boolean;
}

class GameComputedStore {
  constructor() {
    makeAutoObservable(this);
  }

  private getWinningPosition(homeScore: number, awayScore: number): { row: number; col: number } {
    const homeLastDigit = homeScore % 10;
    const awayLastDigit = awayScore % 10;
    const col = boardStore.colNumbers.indexOf(homeLastDigit);
    const row = boardStore.rowNumbers.indexOf(awayLastDigit);
    return { row, col };
  }

  get winningPosition(): { row: number; col: number } | null {
    if (!boardStore.numbersLocked || !scoreStore.gameScore) {
      return null;
    }
    const pos = this.getWinningPosition(
      scoreStore.gameScore.home.score,
      scoreStore.gameScore.away.score
    );
    if (pos.row === -1 || pos.col === -1) {
      return null;
    }
    return pos;
  }

  get winningBadges(): Record<string, string[]> {
    const badges: Record<string, string[]> = {};

    if (!boardStore.numbersLocked || !scoreStore.gameScore) {
      return badges;
    }

    const cumulativeScores = scoreStore.cumulativeScores;
    const quarters = ["Q1", "Q2", "Q3"];

    // Q1, Q2, Q3 - use cumulative scores
    for (let i = 0; i < 3; i++) {
      if (i < cumulativeScores.length) {
        const { homeScore, awayScore } = cumulativeScores[i];
        const pos = this.getWinningPosition(homeScore, awayScore);
        if (pos.row !== -1 && pos.col !== -1) {
          const key = `${pos.row}-${pos.col}`;
          if (!badges[key]) badges[key] = [];
          badges[key].push(quarters[i]);
        }
      }
    }

    // Final - use actual final score (only when game is over)
    if (scoreStore.isGameOver && scoreStore.finalScore) {
      const pos = this.getWinningPosition(
        scoreStore.finalScore.home,
        scoreStore.finalScore.away
      );
      if (pos.row !== -1 && pos.col !== -1) {
        const key = `${pos.row}-${pos.col}`;
        if (!badges[key]) badges[key] = [];
        badges[key].push("F");
      }
    }

    return badges;
  }

  get totalPot(): number {
    return 100 * boardStore.pricePerSquare;
  }

  get quarterWinners(): QuarterWinner[] {
    const totalPot = this.totalPot;
    const quarters = [
      { label: "Q1", index: 0, payout: totalPot * 0.2, isFinal: false },
      { label: "Q2", index: 1, payout: totalPot * 0.2, isFinal: false },
      { label: "Q3", index: 2, payout: totalPot * 0.2, isFinal: false },
      { label: "F", index: 3, payout: totalPot * 0.4, isFinal: true },
    ];

    return quarters.map(({ label, index, payout, isFinal }) => {
      const winner = this.getQuarterWinner(index, isFinal);
      return { label, payout, winner };
    });
  }

  private getQuarterWinner(
    quarterIndex: number,
    isFinal: boolean
  ): { displayName: string; score: string } | null {
    const game = scoreStore.gameScore;
    if (!game || !boardStore.numbersLocked) {
      return null;
    }

    let homeCumulative: number;
    let awayCumulative: number;

    if (isFinal) {
      if (!scoreStore.isGameOver) {
        return null;
      }
      homeCumulative = game.home.score;
      awayCumulative = game.away.score;
    } else {
      const cumulativeScores = scoreStore.cumulativeScores;
      if (quarterIndex >= cumulativeScores.length) {
        return null;
      }
      homeCumulative = cumulativeScores[quarterIndex].homeScore;
      awayCumulative = cumulativeScores[quarterIndex].awayScore;
    }

    const pos = this.getWinningPosition(homeCumulative, awayCumulative);
    if (pos.row === -1 || pos.col === -1) {
      return null;
    }

    const square = boardStore.squares[pos.row]?.[pos.col];
    const homeTeam = scoreStore.homeTeamAbbr;
    const awayTeam = scoreStore.awayTeamAbbr;
    const homeNum = boardStore.colNumbers[pos.col];
    const awayNum = boardStore.rowNumbers[pos.row];
    const scoreStr = `${homeTeam} ${homeNum}, ${awayTeam} ${awayNum}`;

    if (!square?.claimedBy) {
      return { displayName: "Unclaimed", score: scoreStr };
    }

    return {
      displayName: square.displayName || square.claimedBy,
      score: scoreStr,
    };
  }

  get mySquares(): Square[] {
    const username = authStore.username;
    const squares: Square[] = [];

    for (const row of boardStore.squares) {
      for (const square of row) {
        if (square.claimedBy === username) {
          squares.push(square);
        }
      }
    }

    return squares;
  }

  get mySquaresPaymentInfo(): SquarePaymentInfo {
    const squares = this.mySquares;
    const paidCount = squares.filter((s) => s.paid).length;
    const unpaidCount = squares.length - paidCount;
    const amountOwed = unpaidCount * boardStore.pricePerSquare;

    return { paidCount, unpaidCount, amountOwed };
  }

  getSquareNumbers(square: Square): { row: number | string; col: number | string } {
    if (!boardStore.numbersLocked) {
      return { row: "?", col: "?" };
    }
    return {
      row: boardStore.rowNumbers[square.row],
      col: boardStore.colNumbers[square.col],
    };
  }

  get mySquaresWithBadges(): MySquareWithBadges[] {
    const winningBadges = this.winningBadges;
    const winningPos = this.winningPosition;

    const squaresWithBadges = this.mySquares.map((square) => {
      const key = `${square.row}-${square.col}`;
      const badges = winningBadges[key] || [];
      const nums = this.getSquareNumbers(square);
      const isCurrentWinner = winningPos?.row === square.row && winningPos?.col === square.col;

      return {
        square,
        homeNum: nums.col,
        awayNum: nums.row,
        badges,
        isCurrentWinner,
      };
    });

    // Sort: winning squares first, then by badges count, then by position
    return squaresWithBadges.sort((a, b) => {
      if (a.isCurrentWinner !== b.isCurrentWinner) {
        return a.isCurrentWinner ? -1 : 1;
      }
      if (a.badges.length !== b.badges.length) {
        return b.badges.length - a.badges.length;
      }
      return 0;
    });
  }

  get scoreChangeScenarios(): ScoreChangeScenario[] {
    if (!boardStore.numbersLocked || !scoreStore.gameScore) {
      return [];
    }

    const game = scoreStore.gameScore;
    const homeScore = game.home.score;
    const awayScore = game.away.score;
    const homeTeam = scoreStore.homeTeamAbbr;
    const awayTeam = scoreStore.awayTeamAbbr;
    const username = authStore.username;

    const scenarios: { label: string; homeDelta: number; awayDelta: number }[] = [
      { label: `${homeTeam} TD`, homeDelta: 7, awayDelta: 0 },
      { label: `${homeTeam} FG`, homeDelta: 3, awayDelta: 0 },
      { label: `${awayTeam} TD`, awayDelta: 7, homeDelta: 0 },
      { label: `${awayTeam} FG`, awayDelta: 3, homeDelta: 0 },
      { label: `${homeTeam} TD+2`, homeDelta: 8, awayDelta: 0 },
      { label: `${awayTeam} TD+2`, awayDelta: 8, homeDelta: 0 },
      { label: `${homeTeam} TD+Miss`, homeDelta: 6, awayDelta: 0 },
      { label: `${awayTeam} TD+Miss`, awayDelta: 6, homeDelta: 0 },
      { label: `${homeTeam} Safety`, homeDelta: 2, awayDelta: 0 },
      { label: `${awayTeam} Safety`, awayDelta: 2, homeDelta: 0 },
    ];

    return scenarios.map(({ label, homeDelta, awayDelta }) => {
      const newHomeScore = homeScore + homeDelta;
      const newAwayScore = awayScore + awayDelta;
      const pos = this.getWinningPosition(newHomeScore, newAwayScore);

      const square = pos.row !== -1 && pos.col !== -1
        ? boardStore.squares[pos.row]?.[pos.col]
        : null;

      return {
        label,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        owner: square?.claimedBy || null,
        displayName: square?.displayName || square?.claimedBy || null,
        homeNum: newHomeScore % 10,
        awayNum: newAwayScore % 10,
        isMine: square?.claimedBy === username,
      };
    });
  }
}

export const gameComputedStore = new GameComputedStore();
