import { NextRequest, NextResponse } from "next/server";
import { validateShareToken } from "@/lib/redis";
import { createShareSessionCookie, getShareSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const shareSession = await getShareSession();

  if (shareSession && shareSession.boardId === boardId) {
    return NextResponse.json({
      valid: true,
      displayName: shareSession.displayName,
    });
  }

  return NextResponse.json({ valid: false });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const { displayName, shareToken } = await request.json();

    if (!displayName || typeof displayName !== "string") {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    if (!shareToken || typeof shareToken !== "string") {
      return NextResponse.json(
        { error: "Share token is required" },
        { status: 400 }
      );
    }

    const isValid = await validateShareToken(boardId, shareToken);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid share token" },
        { status: 401 }
      );
    }

    const shareSession = {
      boardId,
      shareToken,
      displayName: displayName.trim(),
    };

    const response = NextResponse.json({ success: true, displayName: shareSession.displayName });
    response.headers.set("Set-Cookie", createShareSessionCookie(shareSession));

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
