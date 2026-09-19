import '../styles/globals.scss';
import {createHeader} from '../components/header/header';
import {createHeroSection} from '../components/hero-section/hero-section.ts';
import {createCarouselSection} from '../components/carousel-section/carousel-section.ts';
import {createLeadBoardSection} from '../components/leaderboard-table-section/leaderboard-table-section.ts';
import {createGameDevelopersSection} from '../components/game-developers-section/game-developers-section.ts';
import {createFooter} from "../components/footer/ footer.ts";

const app = document.createElement('div');

app.id = 'app';

const header = createHeader();
const main = document.createElement('main');
const heroSection = createHeroSection();
const carouselSection = createCarouselSection();
const leadBoardSection = createLeadBoardSection();
const gameDevelopersSection = createGameDevelopersSection();
const footer = createFooter()

main.append(heroSection, carouselSection, leadBoardSection, gameDevelopersSection);

app.prepend(header, main, footer);

document.body.append(app);
