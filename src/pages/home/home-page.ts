import { createHeroSection } from '../../components/hero-section/hero-section.ts';
import { createCarouselSection } from '../../components/carousel-section/carousel-section.ts';
import { createGameDevelopersSection } from '../../components/game-developers-section/game-developers-section.ts';

export function createHomePage() {
  const page = document.createDocumentFragment();

  page.append(
    createHeroSection(),
    createCarouselSection(),
    createGameDevelopersSection(),
    createGameDevelopersSection(),
  );

  return page;
}
