import './library-section.scss';
import { createGamesFilter } from './games-filter/games-filter.ts';
import type { GameCategory } from './games-filter/games-filter.ts';
import { createSortingElement, SortingValue, sortingValues } from './sorting/sorting.ts';
import { createGameCardsWrapper } from './game-card-wrapper/game-card-wrapper.ts';
import { createPagination } from './pagination/pagination.ts';
import { GamesData } from './types/game.ts';

export function createLibrarySection(
  gamesData: GamesData | 'loading' | 'error',
  changeCategory: (category: GameCategory) => void,
  changeSortValue: (sortValue: SortingValue) => void,
  selectedCategory: GameCategory = 'all',
  sortValue: SortingValue = sortingValues[0],
  changePaginationPage: (newPage: number) => void,
  onRetry?: () => void,
  signal?: AbortSignal,
) {
  const data = typeof gamesData === 'string' ? gamesData : gamesData.data;

  const librarySection = document.createElement('section');
  librarySection.classList.add('librarySection', 'container');

  const sectionHeader = document.createElement('h1');
  sectionHeader.classList.add('sectionHeader');
  sectionHeader.textContent = 'Game Library';

  const subtitle = document.createElement('p');
  subtitle.classList.add('subTitle');
  subtitle.textContent = 'Browse our collection of casual mini-games';

  const topSectionBlock = document.createElement('div');
  topSectionBlock.classList.add('topSectionBlock');

  topSectionBlock.append(sectionHeader, subtitle);

  const middleSection = document.createElement('div');
  middleSection.classList.add('middleSection');

  middleSection.append(
    createGamesFilter(changeCategory, selectedCategory),
    createSortingElement(sortValue, changeSortValue, signal),
  );

  librarySection.append(topSectionBlock, middleSection, createGameCardsWrapper(data, onRetry));

  if (typeof gamesData !== 'string') {
    const isEmpty = gamesData.data.length === 0;
    const currentPage = isEmpty ? 1 : gamesData.meta.page;
    const totalPages = isEmpty ? 1 : Math.max(1, gamesData.meta.totalPages);
    librarySection.append(createPagination(currentPage, changePaginationPage, totalPages, signal));
  }

  return { element: librarySection };
}
