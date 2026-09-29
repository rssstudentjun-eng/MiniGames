import { GameType } from '../types/game.ts';
import { createGameCard } from './game-card/game-card.ts';
import './game-card-wrapper.scss';

export function createGameCardsWrapper(gamesData: GameType[]) {
  // const { data } = gamesData;
  console.log('in wrapper', gamesData);
  const gameCardsWrapper = document.createElement('div');
  gameCardsWrapper.classList.add('gameCardsWrapper');

  const slicedContent = gamesData.slice(0, 6);

  for (const gameCard of slicedContent) {
    gameCardsWrapper.append(createGameCard(gameCard));
  }

  return gameCardsWrapper;
}
