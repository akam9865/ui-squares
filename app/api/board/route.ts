import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBoardState, claimSquare } from "@/lib/redis";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boardState = await getBoardState();
  return NextResponse.json(boardState);
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { row, col } = await request.json();

    if (typeof row !== "number" || typeof col !== "number") {
      return NextResponse.json(
        { error: "Invalid row or col" },
        { status: 400 }
      );
    }

    if (row < 0 || row > 9 || col < 0 || col > 9) {
      return NextResponse.json(
        { error: "Row and col must be between 0 and 9" },
        { status: 400 }
      );
    }

    const result = await claimSquare(row, col, session.username);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const boardState = await getBoardState();
    return NextResponse.json({ success: true, boardState });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
