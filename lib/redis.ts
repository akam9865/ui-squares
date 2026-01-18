import { Redis } from "@upstash/redis";
import { BoardState, Square } from "@/types";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const BOARD_KEY = "board:state";

function createEmptyBoard(): BoardState {
  const squares: Square[][] = [];
  for (let row = 0; row < 10; row++) {
    squares[row] = [];
    for (let col = 0; col < 10; col++) {
      squares[row][col] = {
        row,
        col,
        owner: null,
        claimedAt: null,
        paid: false,
        paidAt: null,
      };
    }
  }
  return {
    squares,
    rowNumbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    colNumbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    numbersLocked: false,
  };
}

export async function getBoardState(): Promise<BoardState> {
  const data = await redis.get<BoardState>(BOARD_KEY);
  if (!data) {
    const emptyBoard = createEmptyBoard();
    await redis.set(BOARD_KEY, emptyBoard);
    return emptyBoard;
  }
  return data;
}

export async function setBoardState(state: BoardState): Promise<void> {
  await redis.set(BOARD_KEY, state);
}

export async function claimSquare(
  row: number,
  col: number,
  username: string
): Promise<{ success: boolean; error?: string }> {
  const state = await getBoardState();
  const square = state.squares[row]?.[col];

  if (!square) {
    return { success: false, error: "Invalid square position" };
  }

  if (square.owner) {
    return { success: false, error: "Square already claimed" };
  }

  state.squares[row][col] = {
    ...square,
    owner: username,
    claimedAt: new Date().toISOString(),
  };

  await setBoardState(state);
  return { success: true };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function randomizeNumbers(): Promise<{
  success: boolean;
  error?: string;
}> {
  const state = await getBoardState();

  if (state.numbersLocked) {
    return { success: false, error: "Numbers already randomized" };
  }

  state.rowNumbers = shuffleArray(state.rowNumbers);
  state.colNumbers = shuffleArray(state.colNumbers);
  state.numbersLocked = true;

  await setBoardState(state);
  return { success: true };
}

export async function setSquarePaid(
  row: number,
  col: number,
  paid: boolean
): Promise<{ success: boolean; error?: string }> {
  const state = await getBoardState();
  const square = state.squares[row]?.[col];

  if (!square) {
    return { success: false, error: "Invalid square position" };
  }

  if (!square.owner) {
    return { success: false, error: "Square not claimed" };
  }

  state.squares[row][col] = {
    ...square,
    paid,
    paidAt: paid ? new Date().toISOString() : null,
  };

  await setBoardState(state);
  return { success: true };
}

export async function clearSquare(
  row: number,
  col: number
): Promise<{ success: boolean; error?: string }> {
  const state = await getBoardState();
  const square = state.squares[row]?.[col];

  if (!square) {
    return { success: false, error: "Invalid square position" };
  }

  state.squares[row][col] = {
    row,
    col,
    owner: null,
    claimedAt: null,
    paid: false,
    paidAt: null,
  };

  await setBoardState(state);
  return { success: true };
}

export async function getClaimedSquares(): Promise<Square[]> {
  const state = await getBoardState();
  const claimed: Square[] = [];

  for (const row of state.squares) {
    for (const square of row) {
      if (square.owner) {
        claimed.push(square);
      }
    }
  }

  return claimed;
}
