import leftArrow from '../../assets/icons/arrow_back.svg';
import rightArrow from '../../assets/icons/arrow_forward.svg';
import './carousel-section.scss';
import { createGameCard, Game } from './game-card/game-card.ts';
import vacationCafeImage from '../../assets/images/vacation_cafe_slider.png';
import winterBorrowImage from '../../assets/images/winter_burrow_slider.jpg';
import shelveThePotionsImage from '../../assets/images/shelve_the_potions_slider.jpg';
import islandersShoresImage from '../../assets/images/islanders_new_shores_slider.jpg';
import candyCrushImage from '../../assets/images/candy_crush_slider.png';

const games: Game[] = [
  {
    slug: 'palia',
    name: 'Palia',
    category: 'strategy',
    price: 'Free',
    shortDescription:
      'A free-to-play fantasy life sim adventure where you can craft, explore, and create the life and home of your dreams in a vibrant, heartwarming world.',
    rating: 4.8,
    likesCount: 89_500,
    cardImage: candyCrushImage,
    featured: true,
  },
  {
    slug: 'islanders-new-shores',
    name: 'ISLANDERS: New Shores',
    category: 'strategy',
    price: 'Free',
    shortDescription:
      'Build your island retreat in a calm, minimalist world with exciting new features that keep the classic charm while inspiring fresh creativity.',
    rating: 4.9,
    likesCount: 54_200,
    cardImage: islandersShoresImage,
    featured: true,
  },
  {
    slug: 'vacation-cafe-simulator',
    name: 'Vacation Cafe Simulator',
    category: 'strategy',
    price: 'Free',
    shortDescription:
      'Cozy Italian Vacation Cafe 🏖️ No timers, No stress 😌 cook traditional dishes 🍝 upgrade and customize 🏠 just drink Prosecco 🥂 relax and grow your dream cafe ✨',
    rating: 4.8,
    likesCount: 28_750,
    cardImage: vacationCafeImage,
    featured: true,
  },
  {
    slug: 'winter-burrow',
    name: 'Winter Burrow',
    category: 'farm',
    price: 'Free',
    shortDescription:
      'A cozy woodland survival game about a mouse restoring their childhood burrow. Explore, gather resources, craft, knit warm sweaters, bake pies and meet the locals.',
    rating: 4.9,
    likesCount: 32_400,
    cardImage: winterBorrowImage,
    featured: true,
  },
  {
    slug: 'wytchwood',
    name: 'Wytchwood',
    category: 'strategy',
    price: '$4.99',
    shortDescription:
      'A crafting adventure game set in a land of gothic fables. As the old witch, explore, collect ingredients, brew spells, and pass judgement upon a capricious cast of characters.',
    rating: 4.7,
    likesCount: 33_100,
    cardImage: shelveThePotionsImage,
    featured: false,
  },
];

export function createCarouselSection(): HTMLElement {
  const carouselSection = document.createElement('section');
  carouselSection.classList.add('carouselSection', 'container');

  const carouselSectionTitle = document.createElement('h2');
  carouselSectionTitle.classList.add('sectionCarouselTitle');
  carouselSectionTitle.textContent = 'New Games';

  const previousButtonImage = document.createElement('img');
  previousButtonImage.alt = 'Previous Button';
  previousButtonImage.src = leftArrow;
  const sliderButtonImagePrevious = document.createElement('button');
  sliderButtonImagePrevious.type = 'button';
  sliderButtonImagePrevious.disabled = true;
  sliderButtonImagePrevious.append(previousButtonImage);

  const nextButtonImage = document.createElement('img');
  nextButtonImage.alt = 'Next Button';
  nextButtonImage.src = rightArrow;
  const sliderButtonImageNext = document.createElement('button');
  sliderButtonImageNext.type = 'button';
  sliderButtonImageNext.disabled = true;
  sliderButtonImageNext.append(nextButtonImage);

  for (const button of [sliderButtonImagePrevious, sliderButtonImageNext]) {
    button.classList.add('carouselButton');
  }

  const carouselWrapperButtons = document.createElement('div');
  carouselWrapperButtons.classList.add('carouselWrapperButtons');

  carouselWrapperButtons.append(sliderButtonImagePrevious, sliderButtonImageNext);

  const carouselSectionHeader = document.createElement('div');
  carouselSectionHeader.classList.add('carouselSectionHeader');

  const track = document.createElement('ul');
  track.classList.add('carouselTrack');

  for (const game of games) {
    track.append(createGameCard(game));
  }

  carouselSectionHeader.append(carouselSectionTitle, carouselWrapperButtons);

  carouselSection.append(carouselSectionHeader, track);

  return carouselSection;
}
