"use server";

import { getSession } from "@/lib/session";
import { listBoards, createBoard } from "@/lib/redis";
import { BoardMeta } from "@/types";

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireAdmin() {
  const session = await requireAuth();
  if (!session.isAdmin) {
    throw new Error("Admin access required");
  }
  return session;
}

export async function listBoardsAction(): Promise<BoardMeta[]> {
  await requireAuth();
  return listBoards();
}

export async function createBoardAction(
  boardId: string,
  name: string,
  gameId: string | null,
  sport: "nfl" | "cfb" = "nfl",
  pricePerSquare: number = 10
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  if (!boardId || !name) {
    return { success: false, error: "Board ID and name are required" };
  }

  // Validate boardId format (alphanumeric and hyphens only)
  if (!/^[a-zA-Z0-9-]+$/.test(boardId)) {
    return { success: false, error: "Board ID can only contain letters, numbers, and hyphens" };
  }

  return createBoard(boardId, name, gameId, sport, pricePerSquare);
}
