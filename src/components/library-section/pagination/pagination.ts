import './pagination.scss';
import paginationArrowIcon from '../../../assets/icons/paginationArrowIcon.svg';

function createArrow(label: string, className: string) {
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('paginationArrow', className);
  button.setAttribute('aria-label', label);

  const image = document.createElement('img');
  image.src = paginationArrowIcon;
  image.alt = '';

  button.append(image);

  return button;
}

export function createPagination(totalPages = 8): HTMLElement {
  if (!Number.isSafeInteger(totalPages) || totalPages < 1) {
    throw new RangeError('totalPages must be a positive integer');
  }

  let currentPage = 1;

  const mobileQuery = globalThis.matchMedia('(max-width: 760px)');

  const paginationWrapper = document.createElement('nav');
  paginationWrapper.classList.add('paginationWrapper');
  paginationWrapper.setAttribute('aria-label', 'Pagination');

  const pagesList = document.createElement('ul');
  pagesList.classList.add('paginationList');

  const leftButton = createArrow('Previous page', 'leftBtn');
  const rightButton = createArrow('Next page', 'rightBtn');

  function selectPage(page: number) {
    if (page === currentPage || page < 1 || page > totalPages) {
      return;
    }

    currentPage = page;
    render();
  }

  function render() {
    const focusedElement = document.activeElement;
    const hadPageFocus = pagesList.contains(focusedElement);

    const visibleCount = Math.min(mobileQuery.matches ? 3 : 4, totalPages);

    const startPage = Math.max(
      1,
      Math.min(currentPage - Math.floor((visibleCount - 1) / 2), totalPages - visibleCount + 1),
    );

    pagesList.replaceChildren();

    let activeButton: HTMLButtonElement | undefined;

    for (let page = startPage; page < startPage + visibleCount; page++) {
      const item = document.createElement('li');
      item.classList.add('paginationItem');

      const button = document.createElement('button');
      button.type = 'button';
      button.classList.add('paginationBtn');
      button.textContent = String(page);
      button.setAttribute('aria-label', `Page ${page}`);

      if (page === currentPage) {
        button.classList.add('active');
        button.setAttribute('aria-current', 'page');
        activeButton = button;
      }

      button.addEventListener('click', () => {
        selectPage(page);
      });

      item.append(button);
      pagesList.append(item);
    }

    leftButton.disabled = currentPage === 1;
    rightButton.disabled = currentPage === totalPages;

    if (
      hadPageFocus ||
      (focusedElement === leftButton && leftButton.disabled) ||
      (focusedElement === rightButton && rightButton.disabled)
    ) {
      activeButton?.focus();
    }
  }

  leftButton.addEventListener('click', () => {
    selectPage(currentPage - 1);
  });

  rightButton.addEventListener('click', () => {
    selectPage(currentPage + 1);
  });

  mobileQuery.addEventListener('change', render);

  paginationWrapper.append(leftButton, pagesList, rightButton);
  render();

  return paginationWrapper;
}
