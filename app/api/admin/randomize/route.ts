import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { randomizeNumbers, getBoardState } from "@/lib/redis";

export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const result = await randomizeNumbers();

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const boardState = await getBoardState();
  return NextResponse.json({ success: true, boardState });
}
