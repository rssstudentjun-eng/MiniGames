import { createHeroSection } from '../../components/hero-section/hero-section.ts';
import { createCarouselSection } from '../../components/carousel-section/carousel-section.ts';
import { createGameDevelopersSection } from '../../components/game-developers-section/game-developers-section.ts';
import { createLeadBoardSection } from '../../components/leaderboard-table-section/leaderboard-table-section.ts';
import { getLeaderBoard, getSliderGames } from '../../services/api.ts';
import { showSnackbar } from '../../components/snackbar/snackbar.ts';

export function createHomePage() {
  const page = document.createDocumentFragment();
  const carouselContainer = document.createElement('div');
  const leaderBoardContainer = document.createElement('div');

  const controller = new AbortController();

  let destroyCarousel: (() => void) | undefined;

  page.append(
    createHeroSection(),
    carouselContainer,
    leaderBoardContainer,
    createGameDevelopersSection(),
  );

  async function loadLeaderBoard(isRetry = false): Promise<void> {
    if (controller.signal.aborted) return;

    leaderBoardContainer.replaceChildren(createLeadBoardSection('loading').element);

    try {
      const leaderBoardData = await getLeaderBoard(controller.signal);
      if (controller.signal.aborted) return;
      if (isRetry) showSnackbar('Leaderboard loaded.', 'success');
      const leaderBoard = createLeadBoardSection(leaderBoardData);
      leaderBoardContainer.replaceChildren(leaderBoard.element);
    } catch {
      if (controller.signal.aborted) return;
      showSnackbar('Could not load the leaderboard.', 'error');
      const errorSection = createLeadBoardSection('error', () => void loadLeaderBoard(true));
      leaderBoardContainer.replaceChildren(errorSection.element);
    }
  }

  async function loadCarousel(isRetry = false): Promise<void> {
    if (controller.signal.aborted) return;

    destroyCarousel?.();
    destroyCarousel = undefined;
    carouselContainer.replaceChildren(createCarouselSection('loading').element);

    try {
      const gamesData = await getSliderGames(controller.signal);

      if (controller.signal.aborted) return;

      if (isRetry) showSnackbar('Featured games loaded.', 'success');
      const carousel = createCarouselSection(gamesData);

      destroyCarousel = carousel.destroy;
      carouselContainer.replaceChildren(carousel.element);
    } catch {
      if (controller.signal.aborted) return;
      showSnackbar('Could not load featured games.', 'error');
      const errorSection = createCarouselSection('error', () => void loadCarousel(true));
      carouselContainer.replaceChildren(errorSection.element);
    }
  }

  void loadCarousel();
  void loadLeaderBoard();

  return {
    content: page,
    destroy() {
      controller.abort();
      destroyCarousel?.();
    },
  };
}
