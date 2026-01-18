import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const gamePassword = process.env.GAME_PASSWORD;
    const adminPassword = process.env.ADMIN_PASSWORD;

    let isAdmin = false;

    if (password === adminPassword) {
      isAdmin = true;
    } else if (password !== gamePassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      username,
      isAdmin,
    });

    response.headers.set(
      "Set-Cookie",
      createSessionCookie({ username, isAdmin })
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
