import { Redis } from "@upstash/redis";
import { BoardState, Square, BoardMeta, Sport } from "@/types";

const redis = Redis.fromEnv();

const BOARDS_INDEX_KEY = "boards:index";

function getBoardKey(boardId: string): string {
  return `board:${boardId}:state`;
}

function createEmptyBoard(name: string, gameId: string | null, sport: Sport, pricePerSquare: number = 10): BoardState {
  const squares: Square[][] = [];
  for (let row = 0; row < 10; row++) {
    squares[row] = [];
    for (let col = 0; col < 10; col++) {
      squares[row][col] = {
        row,
        col,
        claimedBy: null,
        claimedAt: null,
        displayName: null,
        owner: null,
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
    gameId,
    sport,
    name,
    createdAt: new Date().toISOString(),
    pricePerSquare,
  };
}

export async function listBoards(): Promise<BoardMeta[]> {
  const boardIds = await redis.smembers(BOARDS_INDEX_KEY);
  const boards: BoardMeta[] = [];

  for (const id of boardIds) {
    const state = await redis.get<BoardState>(getBoardKey(id));
    if (state) {
      let claimedCount = 0;
      for (const row of state.squares) {
        for (const square of row) {
          if (square.claimedBy) claimedCount++;
        }
      }
      boards.push({
        id,
        name: state.name || id,
        gameId: state.gameId || null,
        sport: state.sport || "nfl",
        createdAt: state.createdAt || new Date().toISOString(),
        claimedCount,
      });
    }
  }

  return boards.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createBoard(
  boardId: string,
  name: string,
  gameId: string | null,
  sport: Sport = "nfl",
  pricePerSquare: number = 10
): Promise<{ success: boolean; error?: string }> {
  const key = getBoardKey(boardId);
  const existing = await redis.get(key);

  if (existing) {
    return { success: false, error: "Board already exists" };
  }

  const board = createEmptyBoard(name, gameId, sport, pricePerSquare);
  await redis.set(key, board);
  await redis.sadd(BOARDS_INDEX_KEY, boardId);

  return { success: true };
}

export async function getBoardState(boardId: string): Promise<BoardState> {
  const key = getBoardKey(boardId);
  const data = await redis.get<BoardState>(key);

  if (!data) {
    // Auto-create board with default name and nfl sport
    const emptyBoard = createEmptyBoard(boardId, null, "nfl");
    await redis.set(key, emptyBoard);
    await redis.sadd(BOARDS_INDEX_KEY, boardId);
    return emptyBoard;
  }

  // Migrate old data
  let needsMigration = false;

  // Migrate square fields if missing
  for (const row of data.squares) {
    for (const square of row) {
      if (square.paid === undefined) {
        square.paid = false;
        square.paidAt = null;
        needsMigration = true;
      }
      if (square.displayName === undefined) {
        // Migrate: old 'owner' becomes 'displayName'
        square.displayName = (square as { owner?: string | null }).owner || null;
        needsMigration = true;
      }
      if (square.claimedBy === undefined) {
        // Migrate: old 'owner' becomes 'claimedBy'
        square.claimedBy = (square as { owner?: string | null }).owner || null;
        needsMigration = true;
      }
      if (square.owner === undefined) {
        square.owner = null;
        needsMigration = true;
      }
    }
  }

  // Add name/gameId/createdAt if missing
  if (!data.name) {
    data.name = boardId;
    needsMigration = true;
  }
  if (data.gameId === undefined) {
    data.gameId = null;
    needsMigration = true;
  }
  if (!data.createdAt) {
    data.createdAt = new Date().toISOString();
    needsMigration = true;
  }
  // Add sport if missing (default to nfl for backward compatibility)
  if (!data.sport) {
    data.sport = "nfl";
    needsMigration = true;
  }
  // Add pricePerSquare if missing (default to 10)
  if (data.pricePerSquare === undefined) {
    data.pricePerSquare = 10;
    needsMigration = true;
  }

  if (needsMigration) {
    await redis.set(key, data);
    await redis.sadd(BOARDS_INDEX_KEY, boardId);
  }

  return data;
}

export async function setBoardState(boardId: string, state: BoardState): Promise<void> {
  await redis.set(getBoardKey(boardId), state);
}

export async function updateBoardMeta(
  boardId: string,
  updates: { name?: string; gameId?: string | null; sport?: Sport; pricePerSquare?: number }
): Promise<{ success: boolean; error?: string }> {
  const state = await getBoardState(boardId);

  if (updates.name !== undefined) {
    state.name = updates.name;
  }
  if (updates.gameId !== undefined) {
    state.gameId = updates.gameId;
  }
  if (updates.sport !== undefined) {
    state.sport = updates.sport;
  }
  if (updates.pricePerSquare !== undefined) {
    state.pricePerSquare = updates.pricePerSquare;
  }

  await setBoardState(boardId, state);
  return { success: true };
}

export async function claimSquare(
  boardId: string,
  row: number,
  col: number,
  username: string
): Promise<{ success: boolean; error?: string }> {
  const state = await getBoardState(boardId);
  const square = state.squares[row]?.[col];

  if (!square) {
    return { success: false, error: "Invalid square position" };
  }

  if (square.claimedBy) {
    return { success: false, error: "Square already claimed" };
  }

  state.squares[row][col] = {
    ...square,
    claimedBy: username,
    claimedAt: new Date().toISOString(),
    displayName: username,
  };

  await setBoardState(boardId, state);
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

export async function randomizeNumbers(boardId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const state = await getBoardState(boardId);

  if (state.numbersLocked) {
    return { success: false, error: "Numbers already randomized" };
  }

  state.rowNumbers = shuffleArray(state.rowNumbers);
  state.colNumbers = shuffleArray(state.colNumbers);
  state.numbersLocked = true;

  await setBoardState(boardId, state);
  return { success: true };
}

export async function setSquarePaid(
  boardId: string,
  row: number,
  col: number,
  paid: boolean
): Promise<{ success: boolean; error?: string }> {
  const state = await getBoardState(boardId);
  const square = state.squares[row]?.[col];

  if (!square) {
    return { success: false, error: "Invalid square position" };
  }

  if (!square.claimedBy) {
    return { success: false, error: "Square not claimed" };
  }

  if (paid) {
    // When marking paid, apply to all squares with the same claimedBy
    const claimedBy = square.claimedBy;
    const paidAt = new Date().toISOString();
    for (const rowSquares of state.squares) {
      for (const s of rowSquares) {
        if (s.claimedBy === claimedBy) {
          s.paid = true;
          s.paidAt = paidAt;
        }
      }
    }
  } else {
    // When marking unpaid, only apply to this one square
    state.squares[row][col] = {
      ...square,
      paid: false,
      paidAt: null,
    };
  }

  await setBoardState(boardId, state);
  return { success: true };
}

export async function clearSquare(
  boardId: string,
  row: number,
  col: number
): Promise<{ success: boolean; error?: string }> {
  const state = await getBoardState(boardId);
  const square = state.squares[row]?.[col];

  if (!square) {
    return { success: false, error: "Invalid square position" };
  }

  state.squares[row][col] = {
    row,
    col,
    claimedBy: null,
    claimedAt: null,
    displayName: null,
    owner: null,
    paid: false,
    paidAt: null,
  };

  await setBoardState(boardId, state);
  return { success: true };
}

export async function setSquareOwner(
  boardId: string,
  row: number,
  col: number,
  owner: string | null
): Promise<{ success: boolean; error?: string }> {
  const state = await getBoardState(boardId);
  const square = state.squares[row]?.[col];

  if (!square) {
    return { success: false, error: "Invalid square position" };
  }

  if (!square.claimedBy) {
    return { success: false, error: "Square not claimed" };
  }

  const claimedBy = square.claimedBy;

  // Apply owner to all squares with the same claimedBy
  for (const rowSquares of state.squares) {
    for (const s of rowSquares) {
      if (s.claimedBy === claimedBy) {
        s.owner = owner;
      }
    }
  }

  await setBoardState(boardId, state);
  return { success: true };
}

export async function setSquareDisplayName(
  boardId: string,
  row: number,
  col: number,
  displayName: string | null
): Promise<{ success: boolean; error?: string }> {
  const state = await getBoardState(boardId);
  const square = state.squares[row]?.[col];

  if (!square) {
    return { success: false, error: "Invalid square position" };
  }

  if (!square.claimedBy) {
    return { success: false, error: "Square not claimed" };
  }

  state.squares[row][col] = {
    ...square,
    displayName,
  };

  await setBoardState(boardId, state);
  return { success: true };
}

export async function getClaimedSquares(boardId: string): Promise<Square[]> {
  const state = await getBoardState(boardId);
  const claimed: Square[] = [];

  for (const row of state.squares) {
    for (const square of row) {
      if (square.claimedBy) {
        claimed.push(square);
      }
    }
  }

  return claimed;
}
