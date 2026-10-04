import './not-found-page.scss';
import { navigate } from '../../app/navigation.ts';

export function createNotFoundPage(): HTMLElement {
  const page = document.createElement('section');
  page.classList.add('notFoundPage');

  const title = document.createElement('h1');
  title.classList.add('notFoundTitle');
  title.textContent = '404 - Page not found';

  const message = document.createElement('p');
  message.classList.add('notFoundMessage');
  message.textContent = 'The requested URL does not exist.';

  const homeButton = document.createElement('button');
  homeButton.type = 'button';
  homeButton.classList.add('notFoundButton');
  homeButton.textContent = 'Return to Home Page';
  homeButton.addEventListener('click', () => {
    navigate('/home');
    window.scrollTo(0, 0);
  });

  page.append(title, message, homeButton);
  return page;
}
