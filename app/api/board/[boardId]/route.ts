import { NextRequest, NextResponse } from "next/server";
import { getSession, getShareSession } from "@/lib/session";
import { getBoardState, claimSquare, unclaimSquare, validateShareToken } from "@/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const session = await getSession();
  const shareSession = await getShareSession();

  // Check for share token in query params (allows viewing board before setting display name)
  const shareToken = request.nextUrl.searchParams.get("share");
  const hasValidShareToken = shareToken ? await validateShareToken(boardId, shareToken) : false;

  // Allow access if authenticated, has valid share session, or has valid share token
  if (!session && (!shareSession || shareSession.boardId !== boardId) && !hasValidShareToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boardState = await getBoardState(boardId);
  return NextResponse.json(boardState);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const session = await getSession();
  const shareSession = await getShareSession();

  // Determine username: prefer regular session, fall back to share session
  let username: string | null = null;
  if (session) {
    username = session.username;
  } else if (shareSession && shareSession.boardId === boardId) {
    username = shareSession.displayName;
  }

  if (!username) {
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

    const result = await claimSquare(boardId, row, col, username);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const boardState = await getBoardState(boardId);
    return NextResponse.json({ success: true, boardState });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getSession();

  // Share users cannot unclaim - only regular authenticated users
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { boardId } = await params;
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

    const result = await unclaimSquare(boardId, row, col, session.username);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const boardState = await getBoardState(boardId);
    return NextResponse.json({ success: true, boardState });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
