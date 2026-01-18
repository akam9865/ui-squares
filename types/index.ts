export interface Square {
  row: number;
  col: number;
  owner: string | null;
  claimedAt: string | null;
  paid: boolean;
  paidAt: string | null;
}

export interface BoardState {
  squares: Square[][];
  rowNumbers: number[];
  colNumbers: number[];
  numbersLocked: boolean;
}

export interface SessionData {
  username: string;
  isAdmin: boolean;
}
