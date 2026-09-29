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

export function createCarouselSection(
  gamesData: GamesData | 'loading' | 'error',
  onRetry?: () => void,
) {
  const games = typeof gamesData === 'string' ? [] : gamesData.data;

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

  if (gamesData === 'loading') {
    track.setAttribute('aria-busy', 'true');
    track.setAttribute('aria-label', 'Loading games');
    const skeleton = document.createElement('li');
    skeleton.className = 'carouselSkeleton';
    skeleton.setAttribute('aria-hidden', 'true');
    track.append(skeleton);
  } else if (games.length === 0) {
    const message = document.createElement('li');
    message.className = 'carouselMessage';
    track.classList.add('carouselTrackMessage');
    const text = document.createElement('p');
    text.setAttribute('role', gamesData === 'error' ? 'alert' : 'status');
    text.textContent =
      gamesData === 'error' ? "The games didn't load. Please try again." : 'No featured games yet.';
    message.append(text);

    if (gamesData === 'error') {
      message.classList.add('carouselMessageError');
      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.className = 'carouselRetry';
      retryButton.textContent = 'Try again';
      retryButton.addEventListener('click', () => {
        retryButton.disabled = true;
        onRetry?.();
      });
      message.append(retryButton);
    }
    track.append(message);
  }

  const destroy =
    games.length > 0 ? initializeSlider(track, previousButton, nextButton) : undefined;
  return { element: section, destroy };
}
