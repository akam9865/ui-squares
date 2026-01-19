import { makeAutoObservable, runInAction } from "mobx";
import { BoardState, Square, Sport } from "@/types";

class BoardStore {
  squares: Square[][] = [];
  rowNumbers: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  colNumbers: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  numbersLocked: boolean = false;
  gameId: string | null = null;
  sport: Sport = "nfl";
  name: string = "";
  pricePerSquare: number = 10;
  isLoading: boolean = true;
  error: string | null = null;
  boardId: string | null = null;

  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  updateFromState(state: BoardState) {
    this.squares = state.squares;
    this.rowNumbers = state.rowNumbers;
    this.colNumbers = state.colNumbers;
    this.numbersLocked = state.numbersLocked;
    this.gameId = state.gameId;
    this.sport = state.sport;
    this.name = state.name;
    this.pricePerSquare = state.pricePerSquare;
  }

  async fetchBoard() {
    if (!this.boardId) return;

    try {
      const response = await fetch(`/api/board/${this.boardId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch board");
      }

      const data: BoardState = await response.json();

      runInAction(() => {
        this.updateFromState(data);
        this.isLoading = false;
        this.error = null;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Failed to fetch board";
        this.isLoading = false;
      });
    }
  }

  async claimSquare(
    row: number,
    col: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.boardId) {
      return { success: false, error: "No board selected" };
    }

    try {
      const response = await fetch(`/api/board/${this.boardId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row, col }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      runInAction(() => {
        this.updateFromState(data.boardState);
      });

      return { success: true };
    } catch {
      return { success: false, error: "Failed to claim square" };
    }
  }

  async randomizeNumbers(): Promise<{ success: boolean; error?: string }> {
    if (!this.boardId) {
      return { success: false, error: "No board selected" };
    }

    try {
      const response = await fetch(`/api/board/${this.boardId}/randomize`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      runInAction(() => {
        this.updateFromState(data.boardState);
      });

      return { success: true };
    } catch {
      return { success: false, error: "Failed to randomize numbers" };
    }
  }

  startPolling(boardId: string) {
    if (this.pollingInterval && this.boardId === boardId) return;

    this.stopPolling();
    this.boardId = boardId;
    this.isLoading = true;

    this.fetchBoard();
    this.pollingInterval = setInterval(() => {
      this.fetchBoard();
    }, 2000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

export const boardStore = new BoardStore();
