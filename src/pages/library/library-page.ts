import { createLibrarySection } from '../../components/library-section/library-section.ts';
import { getGamesUniversal } from '../../services/api.ts';
import type { GameCategory } from '../../components/library-section/games-filter/games-filter.ts';
import { SortingValue, sortingValues } from '../../components/library-section/sorting/sorting.ts';

export function createLibraryPage() {
  const page = document.createDocumentFragment();
  const librarySectionContainer = document.createElement('div');
  let category: GameCategory = 'all';
  let sortValue: SortingValue = sortingValues[0];
  let controller: AbortController | undefined;

  function changeCategory(nextCategory: GameCategory): void {
    category = nextCategory;
    void loadGames();
  }

  function changeSortValue(nextSortValue: SortingValue): void {
    sortValue = nextSortValue;
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
        () => void loadGames(),
      ).element,
    );

    try {
      const games = await getGamesUniversal(requestController.signal, {
        category,
        page: '1',
        sort: sortValue.value,
      });
      if (requestController.signal.aborted) return;
      librarySectionContainer.replaceChildren(
        createLibrarySection(
          games,
          changeCategory,
          changeSortValue,
          category,
          sortValue,
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
          () => void loadGames(),
        ).element,
      );
    }
  }

  void loadGames();
  page.append(librarySectionContainer);
  return page;
}
