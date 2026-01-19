"use server";

import { getSession } from "@/lib/session";
import {
  getClaimedSquares,
  setSquarePaid,
  clearSquare,
  getBoardState,
  setSquareDisplayName,
  setSquareOwner,
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

export async function getClaimedSquaresAction(boardId: string): Promise<Square[]> {
  await requireAdmin();
  return getClaimedSquares(boardId);
}

export async function getBoardStateAction(boardId: string): Promise<BoardState> {
  await requireAdmin();
  return getBoardState(boardId);
}

export async function togglePaidAction(
  boardId: string,
  row: number,
  col: number,
  paid: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  return setSquarePaid(boardId, row, col, paid);
}

export async function clearSquareAction(
  boardId: string,
  row: number,
  col: number
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  return clearSquare(boardId, row, col);
}

export async function setDisplayNameAction(
  boardId: string,
  row: number,
  col: number,
  displayName: string | null
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  return setSquareDisplayName(boardId, row, col, displayName);
}

export async function setOwnerAction(
  boardId: string,
  row: number,
  col: number,
  owner: string | null
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  return setSquareOwner(boardId, row, col, owner);
}
