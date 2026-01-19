import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { randomizeNumbers, getBoardState } from "@/lib/redis";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { boardId } = await params;
  const result = await randomizeNumbers(boardId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const boardState = await getBoardState(boardId);
  return NextResponse.json({ success: true, boardState });
}
