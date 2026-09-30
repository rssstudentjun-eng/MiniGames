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

type GamesParameters = {
  featured?: 'true' | 'false';
  page?: string;
  limit?: string;
  category?: 'all' | 'puzzle' | 'card' | 'match' | 'farm' | 'strategy' | 'arcade';
  sort?: 'rating-desc' | 'rating-asc' | 'name-asc' | 'name-desc';
};

export async function getGamesUniversal(
  signal?: AbortSignal,
  {
    featured = 'false',
    page = '1',
    limit = '6',
    category = 'all',
    sort = 'rating-desc',
  }: GamesParameters = {},
): Promise<GamesData> {
  const searchParameters = new URLSearchParams();

  if (featured === 'true') searchParameters.set('featured', 'true');
  else {
    searchParameters.set('page', String(page));
    searchParameters.set('limit', String(limit));
    searchParameters.set('category', category);
    searchParameters.set('sort', sort);
  }

  const response = await fetch(`${baseUrl}games?${searchParameters}`, { signal });

  if (!response.ok) {
    throw new Error(`error HTTP: ${response.status}`);
  }
  return response.json();
}
