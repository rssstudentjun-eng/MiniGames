import heartIcon from '../../../../assets/icons/heartIcon.svg';
import starIcon from '../../../../assets/icons/starIcon.svg';
import { GameType } from '../../types/game.ts';
import './game-card.scss';

export function createGameCard(game: GameType) {
  const gameCard = document.createElement('div');
  gameCard.classList.add('gameCard');

  const gameCardImage = document.createElement('img');
  gameCardImage.classList.add('gameCardImage');
  gameCardImage.alt = game.name;
  gameCardImage.src = game.cardImage;

  const gameCardInfoBlock = document.createElement('div');
  gameCardInfoBlock.classList.add('gameCardInfoBlock');

  const gameCardTop = document.createElement('div');
  gameCardTop.classList.add('gameCardTop');

  const gameCardTitle = document.createElement('h3');
  gameCardTitle.classList.add('gameCardTitle');
  gameCardTitle.textContent = game.name;

  const gameCardCategoryGame = document.createElement('p');
  gameCardCategoryGame.classList.add('gameCardCategoryGame');
  gameCardCategoryGame.textContent = game.category;

  const gameCardPrice = document.createElement('p');

  gameCardPrice.classList.add(
    'gameCardPrice',
    game.price === 'Free' ? 'gameCardPriceString' : 'gameCardPriceNumber',
  );

  gameCardPrice.textContent = String(game.price);

  const gameCardDescription = document.createElement('p');
  gameCardDescription.classList.add('gameCardDescription');
  gameCardDescription.textContent = game.shortDescription;

  const gameCardBottom = document.createElement('div');
  gameCardBottom.classList.add('gameCardBottom');

  const detailsButton = document.createElement('button');
  detailsButton.type = 'button';
  detailsButton.classList.add('detailsButton');
  detailsButton.textContent = 'Details';

  const statsInfoBlock = document.createElement('div');
  statsInfoBlock.classList.add('statsInfoBlock');

  const ratingBlock = document.createElement('div');
  ratingBlock.classList.add('ratingBlock');
  const ratingBlockImg = document.createElement('img');
  ratingBlockImg.alt = 'Rating';
  ratingBlockImg.src = starIcon;
  ratingBlock.textContent = String(game.rating);
  ratingBlock.prepend(ratingBlockImg);

  const likesBlock = document.createElement('div');
  likesBlock.classList.add('likesBlock');
  const likesBlockImg = document.createElement('img');
  likesBlockImg.alt = 'Likes';
  likesBlockImg.src = heartIcon;
  likesBlock.textContent = `${game.likesCount / 100 / 10}K`;
  likesBlock.prepend(likesBlockImg);

  statsInfoBlock.append(ratingBlock, likesBlock);

  gameCardBottom.append(statsInfoBlock, detailsButton);

  gameCardTop.append(gameCardTitle, gameCardCategoryGame, gameCardPrice);

  gameCardInfoBlock.append(gameCardTop, gameCardDescription, gameCardBottom);

  gameCard.append(gameCardImage, gameCardInfoBlock);

  return gameCard;
}
