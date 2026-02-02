import { cookies } from "next/headers";
import { SessionData, ShareSession } from "@/types";

const SESSION_COOKIE_NAME = "sb-session";
const SHARE_SESSION_COOKIE_NAME = "sb-share-session";

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as SessionData;
  } catch {
    return null;
  }
}

export function createSessionCookie(data: SessionData): string {
  const value = JSON.stringify(data);
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export async function getShareSession(): Promise<ShareSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SHARE_SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as ShareSession;
  } catch {
    return null;
  }
}

export function createShareSessionCookie(data: ShareSession): string {
  const value = JSON.stringify(data);
  return `${SHARE_SESSION_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;
}
