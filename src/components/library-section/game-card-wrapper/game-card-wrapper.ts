import { GameType } from '../types/game.ts';
import { createGameCard } from './game-card/game-card.ts';
import './game-card-wrapper.scss';

export function createGameCardsWrapper(
  gamesData: GameType[] | 'loading' | 'error',
  onRetry?: () => void,
) {
  const gameCardsWrapper = document.createElement('div');
  gameCardsWrapper.classList.add('gameCardsWrapper');

  if (gamesData === 'loading') {
    gameCardsWrapper.setAttribute('aria-busy', 'true');
    gameCardsWrapper.setAttribute('aria-label', 'Loading games');
    for (let index = 0; index < 6; index++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'gameCardSkeleton';
      skeleton.setAttribute('aria-hidden', 'true');
      gameCardsWrapper.append(skeleton);
    }
    return gameCardsWrapper;
  }

  if (gamesData === 'error' || gamesData.length === 0) {
    const message = document.createElement('div');
    message.className = 'gameCardsMessage';
    const text = document.createElement('p');
    text.setAttribute('role', gamesData === 'error' ? 'alert' : 'status');
    text.textContent =
      gamesData === 'error' ? "The games didn't load. Please try again." : 'No games yet.';
    message.append(text);

    if (gamesData === 'error') {
      message.classList.add('gameCardsMessageError');
      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.className = 'gameCardsRetry';
      retryButton.textContent = 'Try again';
      retryButton.disabled = !onRetry;
      retryButton.addEventListener('click', () => {
        retryButton.disabled = true;
        onRetry?.();
      });
      message.append(retryButton);
    }
    gameCardsWrapper.append(message);
    return gameCardsWrapper;
  }

  const slicedContent = gamesData.slice(0, 6);

  for (const gameCard of slicedContent) {
    gameCardsWrapper.append(createGameCard(gameCard));
  }

  return gameCardsWrapper;
}
