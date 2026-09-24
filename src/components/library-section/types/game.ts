export interface GameType {
  slug: string;
  name: string;
  category: string;
  price: string | number;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
  featured: boolean;
}

export interface GamesMetaType {
  totalItems: number;
  description: string;
  featuredCount: number;
}

export interface GamesData {
  data: GameType[];
  meta: GamesMetaType;
}
