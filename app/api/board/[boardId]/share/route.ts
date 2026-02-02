import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createShareToken } from "@/lib/redis";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const token = await createShareToken(boardId);

  const url = new URL(request.url);
  const shareUrl = `${url.protocol}//${url.host}/board/${boardId}?share=${token}`;

  return NextResponse.json({ token, url: shareUrl });
}
