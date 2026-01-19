import { z } from "zod";
import { Sport } from "@/types";

const teamSchema = z.object({
  id: z.string(),
  abbreviation: z.string(),
  displayName: z.string(),
  shortDisplayName: z.string(),
  name: z.string(),
  logo: z.string().optional(),
});

const lineScoreSchema = z.object({
  value: z.number(),
});

const competitorSchema = z.object({
  id: z.string(),
  homeAway: z.enum(["home", "away"]),
  score: z.string(),
  team: teamSchema,
  linescores: z.array(lineScoreSchema).optional(),
});

const statusTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.enum(["pre", "in", "post"]),
  completed: z.boolean(),
  description: z.string(),
});

const statusSchema = z.object({
  clock: z.number(),
  displayClock: z.string(),
  period: z.number(),
  type: statusTypeSchema,
});

const competitionSchema = z.object({
  id: z.string(),
  date: z.string(),
  competitors: z.array(competitorSchema),
  status: statusSchema,
});

const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  date: z.string(),
  competitions: z.array(competitionSchema),
});

export const espnScoreboardSchema = z.object({
  events: z.array(eventSchema),
});

export type ESPNScoreboard = z.infer<typeof espnScoreboardSchema>;
export type ESPNEvent = z.infer<typeof eventSchema>;
export type ESPNCompetitor = z.infer<typeof competitorSchema>;

function getScoreboardUrl(sport: Sport): string {
  if (sport === "cfb") {
    return "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard";
  }
  return "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
}

export async function fetchScoreboard(sport: Sport): Promise<ESPNScoreboard> {
  const response = await fetch(getScoreboardUrl(sport));
  if (!response.ok) {
    throw new Error(`Failed to fetch scores: ${response.status}`);
  }
  const data = await response.json();
  return espnScoreboardSchema.parse(data);
}

export async function fetchGameById(
  gameId: string,
  sport: Sport
): Promise<ESPNEvent | null> {
  const scoreboard = await fetchScoreboard(sport);
  return scoreboard.events.find((event) => event.id === gameId) ?? null;
}

export function findGame(
  scoreboard: ESPNScoreboard,
  team1: string,
  team2: string
): ESPNEvent | null {
  return (
    scoreboard.events.find((event) => {
      const teams = event.competitions[0]?.competitors.map(
        (c) => c.team.abbreviation
      );
      return teams?.includes(team1) && teams?.includes(team2);
    }) ?? null
  );
}

export interface GameInfo {
  homeTeam: {
    abbreviation: string;
    name: string;
    displayName: string;
    score: number;
  };
  awayTeam: {
    abbreviation: string;
    name: string;
    displayName: string;
    score: number;
  };
  period: number;
  clock: string;
  status: "pre" | "in" | "post";
  shortName: string;
}

export function getGameInfo(event: ESPNEvent): GameInfo {
  const competition = event.competitions[0];
  const homeTeam = competition.competitors.find((c) => c.homeAway === "home")!;
  const awayTeam = competition.competitors.find((c) => c.homeAway === "away")!;

  return {
    homeTeam: {
      abbreviation: homeTeam.team.abbreviation,
      name: homeTeam.team.name,
      displayName: homeTeam.team.displayName,
      score: parseInt(homeTeam.score, 10) || 0,
    },
    awayTeam: {
      abbreviation: awayTeam.team.abbreviation,
      name: awayTeam.team.name,
      displayName: awayTeam.team.displayName,
      score: parseInt(awayTeam.score, 10) || 0,
    },
    period: competition.status.period,
    clock: competition.status.displayClock,
    status: competition.status.type.state,
    shortName: event.shortName,
  };
}
