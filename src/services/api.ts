import type { GamesData } from '../components/library-section/types/game.ts';
import type { TopPlayersResponse } from '../components/leaderboard-table-section/leaderboard-table-section.ts';

export const baseUrl = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api/';

export async function getSliderGames(signal?: AbortSignal): Promise<GamesData> {
  const response = await fetch(`${baseUrl}games?featured=true`, { signal });

  if (!response.ok) {
    throw new Error(`error HTTP: ${response.status}`);
  }
  return response.json();
}

export async function getLeaderBoard(signal?: AbortSignal): Promise<TopPlayersResponse> {
  const response = await fetch(`${baseUrl}leaderboard`, { signal });

  if (!response.ok) {
    throw new Error(`error HTTP: ${response.status}`);
  }
  return response.json();
}
