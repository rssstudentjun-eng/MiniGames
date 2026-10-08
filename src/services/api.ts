import type { GamesData } from '../components/library-section/types/game.ts';
import type { Category } from '../components/library-section/games-filter/games-filter.ts';
import {
  GameCommentPost,
  GameCommentsResponse,
  GameDetailsResponse,
  GameFavoriteToggleResponse,
} from '../components/dialogs/types/dialog-types.ts';
import { TopPlayersResponse } from '../components/leaderboard-table-section/types/leaderboard-table-types.ts';

export const baseUrl = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api/';

export class ApiError extends Error {
  constructor(public status: number) {
    super(`error HTTP: ${status}`);
  }
}

export async function getCategories(signal?: AbortSignal): Promise<{ data: Category[] }> {
  const response = await fetch(`${baseUrl}categories`, { signal });
  if (!response.ok) {
    throw new ApiError(response.status);
  }
  return response.json();
}

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

export async function getGameDetails(
  slug: string,
  signal?: AbortSignal,
  userEmail?: string,
): Promise<GameDetailsResponse> {
  const url = new URL(`${baseUrl}games/${encodeURIComponent(slug)}`);
  if (userEmail) url.searchParams.set('userEmail', userEmail);
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new ApiError(response.status);
  }
  return response.json();
}

export async function getGameComments(
  slug: string,
  signal?: AbortSignal,
): Promise<GameCommentsResponse> {
  const parameters = new URLSearchParams({ limit: '3', sort: 'newest' });
  const response = await fetch(
    `${baseUrl}games/${encodeURIComponent(slug)}/comments?${parameters}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`error HTTP: ${response.status}`);
  }
  return response.json();
}

export async function toggleGameFavoriteApi(
  slug: string,
  userEmail: string,
): Promise<GameFavoriteToggleResponse> {
  const response = await fetch(`${baseUrl}games/${encodeURIComponent(slug)}/favorite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userEmail,
    }),
  });

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  return response.json();
}

export async function sendGameComment(
  slug: string,
  userEmail: string,
  authorName: string,
  text: string,
): Promise<GameCommentPost> {
  const response = await fetch(`${baseUrl}games/${encodeURIComponent(slug)}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userEmail,
      authorName,
      text,
    }),
  });
  return response.json();
}
