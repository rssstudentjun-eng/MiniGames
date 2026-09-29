import leftArrow from '../../assets/icons/arrow_back.svg';
import rightArrow from '../../assets/icons/arrow_forward.svg';
import './carousel-section.scss';
import { createGameCard } from './game-card/game-card';
import type { GamesData } from '../library-section/types/game';
import { initializeSlider } from '../../features/slider/slider';

function createArrow(source: string, label: string) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'carouselButton';
  button.setAttribute('aria-label', label);
  const image = document.createElement('img');
  image.src = source;
  image.alt = '';
  button.append(image);
  return button;
}

export function createCarouselSection(gamesData: GamesData) {
  const games = gamesData.data;

  const section = document.createElement('section');
  section.classList.add('carouselSection', 'container');
  section.setAttribute('aria-label', 'Featured games');
  section.setAttribute('aria-roledescription', 'carousel');

  const title = document.createElement('h2');
  title.className = 'sectionCarouselTitle';
  title.textContent = 'New Games';
  const previousButton = createArrow(leftArrow, 'Previous game');
  const nextButton = createArrow(rightArrow, 'Next game');
  previousButton.disabled = games.length < 2;
  nextButton.disabled = games.length < 2;
  const controls = document.createElement('div');
  controls.className = 'carouselWrapperButtons';
  controls.append(previousButton, nextButton);
  const header = document.createElement('div');
  header.className = 'carouselSectionHeader';
  header.append(title, controls);
  const track = document.createElement('ul');
  track.className = 'carouselTrack';
  const cards = games.map((game) => createGameCard(game));
  track.append(...cards);
  section.append(header, track);

  if (games.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No games available';
    track.append(empty);
  }

  const destroy = initializeSlider(track, previousButton, nextButton);
  return { element: section, destroy };
}
