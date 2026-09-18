import './hero-section.scss';

export function createHeroSection(): HTMLElement {
  const heroSection = document.createElement('section');
  heroSection.classList.add('heroSection', 'container');

  const heroSectionInfoBlock = document.createElement('div');
  heroSectionInfoBlock.classList.add('heroSectionInfoBlock');

  const sectionHeroTitle = document.createElement('h2');
  sectionHeroTitle.classList.add('sectionHeroTitle');
  sectionHeroTitle.textContent = 'Take a Short Break & Have Fun';

  const sectionHeroSubtitle = document.createElement('p');
  sectionHeroSubtitle.classList.add('sectionHeroSubtitle');

  sectionHeroSubtitle.textContent =
    'Discover hundreds of curated casual mini-games. Play instantly in your browser';

  const subtitleExtra = document.createElement('span');
  subtitleExtra.classList.add('sectionHeroSubtitleExtra');
  subtitleExtra.textContent = ' — puzzle, match 3, farm, and board classics.';

  sectionHeroSubtitle.append(subtitleExtra);

  const sectionHeroButton = document.createElement('button');
  sectionHeroButton.classList.add('sectionHeroButton');
  sectionHeroButton.textContent = 'Browse Library';

  heroSectionInfoBlock.append(sectionHeroTitle, sectionHeroSubtitle, sectionHeroButton);

  heroSection.append(heroSectionInfoBlock);

  return heroSection;
}
