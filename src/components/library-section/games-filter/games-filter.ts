import './games-filter.scss';

const filterValues = ['All Games', 'Puzzle', 'Card', 'Match', 'Farm', 'Strategy', 'Arcade'];

export function createGamesFilter(): HTMLElement {
  const gamesFilterWrapper = document.createElement('ul');
  gamesFilterWrapper.classList.add('gamesFilterWrapper');

  for (const gamesFilterElement of filterValues) {
    const gameFilterItem = document.createElement('li');

    const gameFilterButton = document.createElement('button');
    gameFilterButton.type = 'button';
    gameFilterButton.classList.add('btn');

    gameFilterItem.append(gameFilterButton);

    gameFilterButton.textContent = gamesFilterElement;

    if (gamesFilterElement === 'All Games') {
      gameFilterButton.classList.add('activeBtn');
    }

    gameFilterButton.addEventListener('click', () => {
      const buttons = gamesFilterWrapper.querySelectorAll('.btn');

      for (const button of buttons) {
        button.classList.remove('activeBtn');
      }
      gameFilterButton.classList.add('activeBtn');
    });

    gamesFilterWrapper.append(gameFilterItem);
  }

  return gamesFilterWrapper;
}
