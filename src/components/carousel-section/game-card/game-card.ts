import './game-card.scss';
import star from '../../../assets/icons/starIcon.svg';
import heart from '../../../assets/icons/heartIcon.svg';
import type { GameType } from '../../library-section/types/game.ts';

export const createGameCard = (game: GameType) => {
  const card = document.createElement('li');
  card.className = 'carouselCard';
  card.tabIndex = 0;
  const content = document.createElement('div');
  content.className = 'carouselCardContent';

  const image = document.createElement('img');
  image.className = 'carouselCardImage';
  image.src = game.cardImage;
  image.alt = game.name;
  image.draggable = false;

  const starImage = document.createElement('img');
  starImage.className = 'carouselCardStar';
  starImage.src = star;
  starImage.alt = 'star Icon';

  const heartImage = document.createElement('img');
  heartImage.className = 'carouselCardHeart';
  heartImage.src = heart;
  heartImage.alt = 'heart icon';

  const info = document.createElement('div');
  info.className = 'carouselCardInfo';

  const title = document.createElement('span');
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
  content.append(image, info);
  card.append(content);

  return card;
};

const likesCounter = (likes: number) => {
  return Math.floor(likes / 100) / 10;
};
