export interface GameSpecs {
  genre: string;
  players: string;
  duration: string;
  price: string;
}

export interface GameTopRecord {
  position: number;
  playerName: string;
  score: number;
  achievedAt: string;
}

export interface GameDetails {
  slug: string;
  name: string;
  heroImage: string;
  rating: number;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  fullDescription: string;
  specs: GameSpecs;
  topRecords: GameTopRecord[];
}

export interface GameDetailsResponse {
  data: GameDetails;
}

export interface GameComment {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export interface GameCommentsMeta {
  totalComments: number;
  returnedCount: number;
  sort?: string;
  additionalProp1?: Record<string, unknown>;
}

export interface GameCommentsResponse {
  data: GameComment[];
  meta: GameCommentsMeta;
}

export interface GameFavoriteToggleResponse {
  data: {
    gameSlug: string;
    isFavorited: boolean;
    likesCount: number;
  };
}
