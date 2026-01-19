import { config } from "dotenv";
config({ path: ".env.local" });

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const BOARD_KEY = "board:state";

interface Square {
  row: number;
  col: number;
  owner: string | null;
  claimedAt: string | null;
  paid: boolean;
  paidAt: string | null;
}

interface BoardState {
  squares: Square[][];
  rowNumbers: number[];
  colNumbers: number[];
  numbersLocked: boolean;
}

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

async function init() {
  const existing = await redis.get(BOARD_KEY);
  if (existing) {
    console.log("Board already exists in Redis");
    return;
  }

  const board = createEmptyBoard();
  await redis.set(BOARD_KEY, board);
  console.log("Board initialized successfully");
}

init().catch(console.error);
