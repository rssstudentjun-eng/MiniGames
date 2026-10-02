import { createLibrarySection } from '../../components/library-section/library-section.ts';
import { getGamesUniversal } from '../../services/api.ts';
import type { GameCategory } from '../../components/library-section/games-filter/games-filter.ts';
import type { SortingValue } from '../../components/library-section/sorting/sorting.ts';
import { updateRouteParameters, type LibraryState } from '../../app/navigation.ts';

function changeCategory(nextCategory: GameCategory): void {
  updateRouteParameters({ category: nextCategory, page: '1' });
}

function changeSortValue(nextSortValue: SortingValue): void {
  updateRouteParameters({ sort: nextSortValue.value, page: '1' });
}

function changePaginationPage(newPage: number): void {
  updateRouteParameters({ page: String(newPage) });
}

export function createLibraryPage(state: LibraryState) {
  const page = document.createDocumentFragment();
  const librarySectionContainer = document.createElement('div');
  const { category, sort: sortValue, page: currentPage } = state;
  let controller: AbortController | undefined;
  let sectionController: AbortController | undefined;

  async function loadGames(): Promise<void> {
    controller?.abort();
    const requestController = new AbortController();
    controller = requestController;
    sectionController?.abort();
    sectionController = new AbortController();

    librarySectionContainer.replaceChildren(
      createLibrarySection(
        'loading',
        changeCategory,
        changeSortValue,
        category,
        sortValue,
        changePaginationPage,
        () => void loadGames(),
        sectionController.signal,
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
      const returnedPage = games.data.length === 0 ? 1 : games.meta.page;
      if (returnedPage !== currentPage) {
        updateRouteParameters({ page: String(returnedPage) }, true);
        return;
      }
      sectionController.abort();
      sectionController = new AbortController();
      librarySectionContainer.replaceChildren(
        createLibrarySection(
          games,
          changeCategory,
          changeSortValue,
          category,
          sortValue,
          changePaginationPage,
          () => void loadGames(),
          sectionController.signal,
        ).element,
      );
    } catch {
      if (requestController.signal.aborted) return;
      sectionController.abort();
      sectionController = new AbortController();
      librarySectionContainer.replaceChildren(
        createLibrarySection(
          'error',
          changeCategory,
          changeSortValue,
          category,
          sortValue,
          changePaginationPage,
          () => void loadGames(),
          sectionController.signal,
        ).element,
      );
    }
  }

  void loadGames();
  page.append(librarySectionContainer);
  return {
    content: page,
    destroy() {
      controller?.abort();
      sectionController?.abort();
    },
  };
}
