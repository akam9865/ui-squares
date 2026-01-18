"use server";

import { getSession } from "@/lib/session";
import {
  getClaimedSquares,
  setSquarePaid,
  clearSquare,
  getBoardState,
} from "@/lib/redis";
import { Square, BoardState } from "@/types";

async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (!session.isAdmin) {
    throw new Error("Admin access required");
  }
  return session;
}

export async function getClaimedSquaresAction(): Promise<Square[]> {
  await requireAdmin();
  return getClaimedSquares();
}

export async function getBoardStateAction(): Promise<BoardState> {
  await requireAdmin();
  return getBoardState();
}

export async function togglePaidAction(
  row: number,
  col: number,
  paid: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  return setSquarePaid(row, col, paid);
}

export async function clearSquareAction(
  row: number,
  col: number
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  return clearSquare(row, col);
}
