import { createHeroSection } from '../../components/hero-section/hero-section.ts';
import { createCarouselSection } from '../../components/carousel-section/carousel-section.ts';
import { createGameDevelopersSection } from '../../components/game-developers-section/game-developers-section.ts';
import { createLeadBoardSection } from '../../components/leaderboard-table-section/leaderboard-table-section.ts';
import { gamesData } from '../../components/library-section/data/games.ts';

export function createHomePage() {
  const page = document.createDocumentFragment();
  const carousel = createCarouselSection(gamesData);

  page.append(
    createHeroSection(),
    carousel.element,
    createLeadBoardSection(),
    createGameDevelopersSection(),
  );

  return { content: page, destroy: carousel.destroy };
}
