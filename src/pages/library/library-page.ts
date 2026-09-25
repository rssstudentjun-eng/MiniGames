import { createLibrarySection } from '../../components/library-section/library-section.ts';

export function createLibraryPage() {
  const page = document.createDocumentFragment();

  page.append(createLibrarySection());

  return page;
}
