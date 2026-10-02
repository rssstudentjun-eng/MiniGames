import { createHeroSection } from '../../components/hero-section/hero-section.ts';
import { createCarouselSection } from '../../components/carousel-section/carousel-section.ts';
import { createGameDevelopersSection } from '../../components/game-developers-section/game-developers-section.ts';
import { createLeadBoardSection } from '../../components/leaderboard-table-section/leaderboard-table-section.ts';
import { getLeaderBoard, getSliderGames } from '../../services/api.ts';

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

  async function loadLeaderBoard(): Promise<void> {
    if (controller.signal.aborted) return;

    leaderBoardContainer.replaceChildren(createLeadBoardSection('loading').element);

    try {
      const leaderBoardData = await getLeaderBoard(controller.signal);
      if (controller.signal.aborted) return;
      const leaderBoard = createLeadBoardSection(leaderBoardData);
      leaderBoardContainer.replaceChildren(leaderBoard.element);
    } catch {
      if (controller.signal.aborted) return;
      const errorSection = createLeadBoardSection('error', () => void loadLeaderBoard());
      leaderBoardContainer.replaceChildren(errorSection.element);
    }
  }

  async function loadCarousel(): Promise<void> {
    if (controller.signal.aborted) return;

    destroyCarousel?.();
    destroyCarousel = undefined;
    carouselContainer.replaceChildren(createCarouselSection('loading').element);

    try {
      const gamesData = await getSliderGames(controller.signal);

      if (controller.signal.aborted) return;

      const carousel = createCarouselSection(gamesData);

      destroyCarousel = carousel.destroy;
      carouselContainer.replaceChildren(carousel.element);
    } catch {
      if (controller.signal.aborted) return;
      const errorSection = createCarouselSection('error', () => void loadCarousel());
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
