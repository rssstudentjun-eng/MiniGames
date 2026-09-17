import '../styles/globals.scss';
import { createHeader } from '../components/header/header';
import { createHeroSection } from '../components/hero-section/hero-section.ts';

const app = document.createElement('div');

app.id = 'app';

const header = createHeader();
const main = document.createElement('main');
const heroSection = createHeroSection();

main.append(heroSection);

app.prepend(header, main);

document.body.append(app);
