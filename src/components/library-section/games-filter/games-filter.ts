import './games-filter.scss';

export const filterValues = [
  'all',
  'puzzle',
  'card',
  'match',
  'farm',
  'strategy',
  'arcade',
] as const;
export type GameCategory = (typeof filterValues)[number];

export function createGamesFilter(
  changeCategory: (category: GameCategory) => void,
  selectedCategory: GameCategory = 'all',
): HTMLElement {
  const gamesFilterWrapper = document.createElement('ul');
  gamesFilterWrapper.classList.add('gamesFilterWrapper');

  for (const gamesFilterElement of filterValues) {
    const gameFilterItem = document.createElement('li');

    const gameFilterButton = document.createElement('button');
    gameFilterButton.type = 'button';
    gameFilterButton.classList.add('btn');

    gameFilterItem.append(gameFilterButton);

    gameFilterButton.textContent = gamesFilterElement;

    if (gamesFilterElement === selectedCategory) {
      gameFilterButton.classList.add('activeBtn');
    }

    gameFilterButton.addEventListener('click', () => {
      changeCategory(gamesFilterElement);
    });

    gamesFilterWrapper.append(gameFilterItem);
  }

  return gamesFilterWrapper;
}
