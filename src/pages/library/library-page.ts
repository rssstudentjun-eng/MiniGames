import { createLibrarySection } from '../../components/library-section/library-section.ts';
import { getGamesUniversal } from '../../services/api.ts';
import type { GameCategory } from '../../components/library-section/games-filter/games-filter.ts';

export function createLibraryPage() {
  const page = document.createDocumentFragment();
  const librarySectionContainer = document.createElement('div');
  let category: GameCategory = 'all';
  let controller: AbortController | undefined;

  function changeCategory(nextCategory: GameCategory): void {
    category = nextCategory;
    void loadGames();
  }

  async function loadGames(): Promise<void> {
    controller?.abort();
    const requestController = new AbortController();
    controller = requestController;

    librarySectionContainer.replaceChildren(
      createLibrarySection('loading', changeCategory, () => void loadGames(), category).element,
    );

    try {
      const games = await getGamesUniversal(requestController.signal, { category, page: '1' });
      if (requestController.signal.aborted) return;
      librarySectionContainer.replaceChildren(
        createLibrarySection(games, changeCategory, () => void loadGames(), category).element,
      );
    } catch {
      if (requestController.signal.aborted) return;
      librarySectionContainer.replaceChildren(
        createLibrarySection('error', changeCategory, () => void loadGames(), category).element,
      );
    }
  }

  void loadGames();
  page.append(librarySectionContainer);
  return page;
}
