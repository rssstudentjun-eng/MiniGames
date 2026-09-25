import { createGamesFilter } from './games-filter/games-filter.ts';
import './library-section.scss';
import { createSortingElement } from './sorting/sorting.ts';
import { createGameCardsWrapper } from './game-card-wrapper/game-card-wrapper.ts';
import { gamesData } from './data/games.ts';
import { createPagination } from './pagination/pagination.ts';

export function createLibrarySection(): HTMLElement {
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

  middleSection.append(createGamesFilter(), createSortingElement());

  librarySection.append(
    topSectionBlock,
    middleSection,
    createGameCardsWrapper(gamesData),
    createPagination(),
  );

  return librarySection;
}
