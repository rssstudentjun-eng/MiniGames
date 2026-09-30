import { createLibrarySection } from '../../components/library-section/library-section.ts';
import { getGamesUniversal } from '../../services/api.ts';
import type { GameCategory } from '../../components/library-section/games-filter/games-filter.ts';
import { SortingValue, sortingValues } from '../../components/library-section/sorting/sorting.ts';

export function createLibraryPage() {
  const page = document.createDocumentFragment();
  const librarySectionContainer = document.createElement('div');
  let category: GameCategory = 'all';
  let sortValue: SortingValue = sortingValues[0];
  let currentPage: number = 1;
  let controller: AbortController | undefined;

  function changeCategory(nextCategory: GameCategory): void {
    category = nextCategory;
    currentPage = 1;
    void loadGames();
  }

  function changeSortValue(nextSortValue: SortingValue): void {
    sortValue = nextSortValue;
    currentPage = 1;
    void loadGames();
  }

  function changePaginationPage(newPage: number): void {
    currentPage = newPage;
    void loadGames();
  }

  async function loadGames(): Promise<void> {
    controller?.abort();
    const requestController = new AbortController();
    controller = requestController;

    librarySectionContainer.replaceChildren(
      createLibrarySection(
        'loading',
        changeCategory,
        changeSortValue,
        category,
        sortValue,
        changePaginationPage,
        () => void loadGames(),
      ).element,
    );

    try {
      const games = await getGamesUniversal(requestController.signal, {
        category,
        page: String(currentPage),
        limit: '6',
        sort: sortValue.value,
      });
      if (requestController.signal.aborted) return;
      currentPage = games.data.length === 0 ? 1 : games.meta.page;
      librarySectionContainer.replaceChildren(
        createLibrarySection(
          games,
          changeCategory,
          changeSortValue,
          category,
          sortValue,
          changePaginationPage,
          () => void loadGames(),
        ).element,
      );
    } catch {
      if (requestController.signal.aborted) return;
      librarySectionContainer.replaceChildren(
        createLibrarySection(
          'error',
          changeCategory,
          changeSortValue,
          category,
          sortValue,
          changePaginationPage,
          () => void loadGames(),
        ).element,
      );
    }
  }

  void loadGames();
  page.append(librarySectionContainer);
  return page;
}
