import './sorting.scss';
import tickIcon from '../../../assets/icons/tickSelectIcon.svg';

const sortingValues = [
  { title: 'Rating  ↑' },
  { title: 'Rating  ↓' },
  { title: 'Name A → Z' },
  { title: 'Name Z → A' },
];

export function createSortingElement(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.classList.add('sortingWrapper');

  const sortingButton = document.createElement('button');
  sortingButton.type = 'button';
  sortingButton.classList.add('sortingButton');

  const label = document.createElement('span');
  label.textContent = 'Sort by:';

  const currentValue = document.createElement('span');
  currentValue.textContent = 'Rating  ↓';

  sortingButton.append(label, currentValue);

  const sortingList = document.createElement('ul');
  sortingList.classList.add('sortingList');

  for (const sortValue of sortingValues) {
    const item = document.createElement('li');

    const optionButton = document.createElement('button');
    optionButton.type = 'button';
    optionButton.classList.add('sortingOption');
    optionButton.textContent = sortValue.title;
    const img = document.createElement('img');
    img.src = tickIcon;
    img.alt = 'Tick';

    if (sortValue.title === currentValue.textContent) {
      optionButton.classList.add('active');
      optionButton.prepend(img);
    }

    optionButton.addEventListener('click', () => {
      currentValue.textContent = sortValue.title;

      const options = sortingList.querySelectorAll('.sortingOption');

      for (const option of options) {
        option.classList.remove('active');
        option.querySelector('img')?.remove();
      }

      optionButton.classList.add('active');
      optionButton.prepend(img);
      sortingList.classList.remove('open');
    });

    item.append(optionButton);
    sortingList.append(item);
  }

  sortingButton.addEventListener('click', () => {
    sortingList.classList.toggle('open');
  });

  sortingButton.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      sortingList.classList.remove('open');
    }
  });

  document.body.addEventListener('click', (event) => {
    if (event.target instanceof Node && !wrapper.contains(event.target)) {
      sortingList.classList.remove('open');
    }
  });

  wrapper.append(sortingButton, sortingList);

  return wrapper;
}
