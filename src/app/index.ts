import '../styles/globals.scss';
import { createHeader } from '../components/header/header';
import { createHeroSection } from '../components/hero-section/hero-section.ts';
import { createCarouselSection } from '../components/carousel-section/carousel-section.ts';

const app = document.createElement('div');

app.id = 'app';

const header = createHeader();
const main = document.createElement('main');
const heroSection = createHeroSection();
const carouselSection = createCarouselSection();

main.append(heroSection, carouselSection);

app.prepend(header, main);

document.body.append(app);
