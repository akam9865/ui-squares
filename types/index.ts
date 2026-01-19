export interface Square {
  row: number;
  col: number;
  claimedBy: string | null;
  claimedAt: string | null;
  displayName: string | null;
  owner: string | null;
  paid: boolean;
  paidAt: string | null;
}

export type Sport = "nfl" | "cfb";

export interface BoardState {
  squares: Square[][];
  rowNumbers: number[];
  colNumbers: number[];
  numbersLocked: boolean;
  gameId: string | null;
  sport: Sport;
  name: string;
  createdAt: string;
  pricePerSquare: number;
}

export interface BoardMeta {
  id: string;
  name: string;
  gameId: string | null;
  sport: Sport;
  createdAt: string;
  claimedCount: number;
}

export interface SessionData {
  username: string;
  isAdmin: boolean;
}
