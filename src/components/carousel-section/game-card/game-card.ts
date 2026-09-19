import './game-card.scss';
import star from '../../../assets/icons/starIcon.svg';
import heart from '../../../assets/icons/heartIcon.svg';

export interface Game {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
  featured: boolean;
}

export const createGameCard = (game: Game) => {
  const card = document.createElement('li');
  card.className = 'carouselCard';

  const image = document.createElement('img');
  image.className = 'carouselCardImage';
  image.src = game.cardImage;
  image.alt = game.name;

  const starImage = document.createElement('img');
  starImage.className = 'carouselCardImage';
  starImage.src = star;
  starImage.alt = 'star Icon';

  const heartImage = document.createElement('img');
  heartImage.className = 'carouselCardHeart';
  heartImage.src = heart;
  heartImage.alt = 'heart icon';

  const info = document.createElement('div');
  info.className = 'carouselCardInfo';

  const title = document.createElement('h3');
  title.className = 'carouselCardTitle';
  title.textContent = game.name;

  const stats = document.createElement('div');
  stats.className = 'carouselCardStats';

  const rating = document.createElement('span');
  rating.className = 'carouselCardRating';
  rating.append(starImage, ` ${game.rating}`);

  const likes = document.createElement('span');
  likes.className = 'carouselCardLikes';
  likes.append(heartImage, `${likesCounter(game.likesCount)}K`);

  stats.append(rating, likes);
  info.append(title, stats);
  card.append(image, info);

  return card;
};

const likesCounter = (likes: number) => {
  return Math.floor(likes / 100) / 10;
};
