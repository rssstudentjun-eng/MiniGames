import { GamesData } from '../types/game.ts';
import { createGameCard } from './game-card/game-card.ts';
import './game-card-wrapper.scss';

export function createGameCardsWrapper(gamesData: GamesData) {
  const { data } = gamesData;

  const gameCardsWrapper = document.createElement('div');
  gameCardsWrapper.classList.add('gameCardsWrapper');

  const slicedContent = data.slice(0, 6);

  for (const gameCard of slicedContent) {
    gameCardsWrapper.append(createGameCard(gameCard));
  }

  return gameCardsWrapper;
}
