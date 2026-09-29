import { createLibrarySection } from '../../components/library-section/library-section.ts';
import { getGamesUniversal } from '../../services/api.ts';

export function createLibraryPage() {
  const page = document.createDocumentFragment();

  const librarySectionContainer = document.createElement('div');

  const controller = new AbortController();

  async function loadGames(): Promise<void> {
    if (controller.signal.aborted) return;

    librarySectionContainer.replaceChildren(createLibrarySection('loading').element);

    try {
      const librarySectionData = await getGamesUniversal(controller.signal);
      if (controller.signal.aborted) return;
      const libraryGames = createLibrarySection(librarySectionData);
      librarySectionContainer.replaceChildren(libraryGames.element);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error(error);
    }
  }

  void loadGames();

  page.append(librarySectionContainer);

  return page;
}
