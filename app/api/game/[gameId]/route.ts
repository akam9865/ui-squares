import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fetchGameById, getGameInfo } from "@/lib/espn";
import { Sport } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { gameId } = await params;
    const { searchParams } = new URL(request.url);
    const sport = (searchParams.get("sport") || "nfl") as Sport;

    const game = await fetchGameById(gameId, sport);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const gameInfo = getGameInfo(game);
    return NextResponse.json(gameInfo);
  } catch (error) {
    console.error("Failed to fetch game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
