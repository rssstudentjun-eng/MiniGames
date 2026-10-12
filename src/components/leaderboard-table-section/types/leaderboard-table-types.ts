export interface TopPlayer {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}

export interface TopPlayersResponse {
  data: TopPlayer[];
  meta: {
    totalItems: number;
    description: string;
  };
}
