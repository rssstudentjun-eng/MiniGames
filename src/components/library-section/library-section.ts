export function createLibrarySection(): HTMLElement {
  const librarySection = document.createElement('section');
  librarySection.classList.add('librarySection', 'container');

  const sectionHeader = document.createElement('h1');
  sectionHeader.classList.add('sectionHeader');
  sectionHeader.textContent = 'Game Library';

  librarySection.append(sectionHeader);

  return librarySection;
}
