import { createLibrarySection } from '../../components/library-section/library-section.ts';
import { getCategories, getGamesUniversal } from '../../services/api.ts';
import type {
  Category,
  GameCategory,
} from '../../components/library-section/games-filter/games-filter.ts';
import type { SortingValue } from '../../components/library-section/sorting/sorting.ts';
import { updateRouteParameters, type LibraryState } from '../../app/navigation.ts';
import { showSnackbar } from '../../components/snackbar/snackbar.ts';

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
  let categories: Category[] = [];
  let controller: AbortController | undefined;
  let sectionController: AbortController | undefined;

  async function loadGames(isRetry = false): Promise<void> {
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
        () => void loadGames(true),
        sectionController.signal,
        categories,
      ).element,
    );

    try {
      const result = await getCategories(requestController.signal);
      if (requestController.signal.aborted) return;
      categories = result.data;
      const defaultCategory = categories.find((item) => item.isDefault)?.slug ?? 'all';
      if (
        category !== defaultCategory &&
        !new URLSearchParams(globalThis.location.search).has('category')
      ) {
        updateRouteParameters({ category: defaultCategory, page: '1' }, true);
        return;
      }
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
      if (isRetry) showSnackbar('Library loaded.', 'success');
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
          () => void loadGames(true),
          sectionController.signal,
          categories,
        ).element,
      );
    } catch {
      if (requestController.signal.aborted) return;
      showSnackbar('Could not load the library.', 'error');
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
          () => void loadGames(true),
          sectionController.signal,
          categories,
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
