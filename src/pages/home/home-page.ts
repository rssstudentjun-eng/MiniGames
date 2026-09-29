import { createHeroSection } from '../../components/hero-section/hero-section.ts';
import { createCarouselSection } from '../../components/carousel-section/carousel-section.ts';
import { createGameDevelopersSection } from '../../components/game-developers-section/game-developers-section.ts';
import { createLeadBoardSection } from '../../components/leaderboard-table-section/leaderboard-table-section.ts';
import { getSliderGames } from '../../services/api.ts';

export function createHomePage() {
  const page = document.createDocumentFragment();
  const carouselContainer = document.createElement('div');
  const controller = new AbortController();

  let destroyCarousel: (() => void) | undefined;

  page.append(
    createHeroSection(),
    carouselContainer,
    createLeadBoardSection(),
    createGameDevelopersSection(),
  );

  async function loadCarousel(): Promise<void> {
    try {
      const gamesData = await getSliderGames(controller.signal);

      if (controller.signal.aborted) return;

      const carousel = createCarouselSection(gamesData);

      destroyCarousel = carousel.destroy;
      carouselContainer.replaceChildren(carousel.element);
    } catch (error) {
      if (controller.signal.aborted) return;

      carouselContainer.textContent = "The games didn't load.";
      console.error(error);
    }
  }

  void loadCarousel();

  return {
    content: page,
    destroy() {
      controller.abort();
      destroyCarousel?.();
    },
  };
}
