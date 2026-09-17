import leftArrow from '../../assets/icons/arrow_back.svg';
import rightArrow from '../../assets/icons/arrow_forward.svg';
import './carousel-section.scss';

export function createCarouselSection(): HTMLElement {
  const carouselSection = document.createElement('section');
  carouselSection.classList.add('carouselSection');

  const carouselSectionTitle = document.createElement('h2');
  carouselSectionTitle.classList.add('sectionCarouselTitle');
  carouselSectionTitle.textContent = 'New Games';

  const previousButton = document.createElement('img');
  previousButton.src = leftArrow;
  const nextButton = document.createElement('img');
  nextButton.src = rightArrow;

  for (const button of [previousButton, nextButton]) {
    button.classList.add('carouselButton');
  }

  const carouselWrapperButtons = document.createElement('div');
  carouselWrapperButtons.classList.add('carouselWrapperButtons');

  carouselWrapperButtons.append(previousButton, nextButton);

  const carouselSectionHeader = document.createElement('div');
  carouselSectionHeader.classList.add('carouselSectionHeader');

  carouselSectionHeader.append(carouselSectionTitle, carouselWrapperButtons);

  carouselSection.append(carouselSectionHeader);

  return carouselSection;
}
