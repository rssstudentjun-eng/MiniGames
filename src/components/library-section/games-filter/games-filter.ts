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

export interface Category {
  slug: GameCategory;
  label: string;
  isDefault: boolean;
}

export function createGamesFilter(
  changeCategory: (category: GameCategory) => void,
  selectedCategory: GameCategory = 'all',
  categories: Category[] = [],
): HTMLElement {
  const gamesFilterWrapper = document.createElement('ul');
  gamesFilterWrapper.classList.add('gamesFilterWrapper');

  for (const category of categories) {
    const gameFilterItem = document.createElement('li');

    const gameFilterButton = document.createElement('button');
    gameFilterButton.type = 'button';
    gameFilterButton.classList.add('btn');

    gameFilterItem.append(gameFilterButton);

    gameFilterButton.textContent = category.label;

    if (category.slug === selectedCategory) {
      gameFilterButton.classList.add('activeBtn');
    }

    gameFilterButton.addEventListener('click', () => {
      changeCategory(category.slug);
    });

    gamesFilterWrapper.append(gameFilterItem);
  }

  return gamesFilterWrapper;
}
